# 🔄 Luồng Xác Minh Thanh Toán (Payment Verification Flow)

> **Module:** `src/modules/payment/`  
> **Cập nhật:** 2026-05-19  
> **Kiến trúc:** Dual-Sync (API thủ công + Cron tự động)

---

## 1. Tổng Quan Kiến Trúc

Hệ thống xác minh thanh toán hoạt động theo mô hình **Dual-Sync** — hai kênh xử lý song song, được bảo vệ bởi **Redis Distributed Lock** để chống race condition.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DUAL-SYNC ARCHITECTURE                       │
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────┐     │
│  │  Kênh 1: API     │          │  Kênh 2: Cron Job        │     │
│  │  (User bấm nút)  │          │  (Tự động mỗi phút)      │     │
│  │                  │          │                          │     │
│  │  POST /verify    │          │  @Cron(EVERY_MINUTE)     │     │
│  │  ↓               │          │  ↓                       │     │
│  │  Redis Lock      │◄────────►│  Redis Lock              │     │
│  │  ↓               │          │  ↓                       │     │
│  │  Gọi TN App      │          │  Fetch TN App 1 lần      │     │
│  │  ↓               │          │  Match trong RAM          │     │
│  │  Update DB       │          │  ↓                       │     │
│  │  ↓               │          │  Update DB               │     │
│  │  Emit Event      │          │  ↓                       │     │
│  └────────┬─────────┘          │  Emit Event              │     │
│           │                    └──────────┬───────────────┘     │
│           │                               │                     │
│           └───────────┬───────────────────┘                     │
│                       ▼                                         │
│           ┌──────────────────────┐                              │
│           │  Kênh 3: Listener    │                              │
│           │  @OnEvent            │                              │
│           │  user.isVerified=true│                              │
│           └──────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Tại sao cần 2 kênh?

| Kênh | Khi nào chạy | Giải quyết vấn đề gì |
|---|---|---|
| **API thủ công** | User bấm "Tôi đã chuyển khoản" | User muốn kết quả **ngay lập tức**, không chờ cron |
| **Cron tự động** | Mỗi phút, chạy ngầm | User chuyển khoản rồi **tắt app / quên bấm nút** |

---

## 2. Kênh 1 — API Thủ Công (Active-Fetch)

### Endpoint

```
POST /api/v1/payments/activation/verify
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Luồng xử lý chi tiết

```
Request đến PaymentController
│
▼
PaymentService.verifyActivationPayment(userId, paymentId)
│
├── 1. findByIdOrFail(paymentId)
│   └── Không tìm thấy → HTTP 404
│
├── 2. Kiểm tra quyền sở hữu
│   └── payment.userId !== userId → HTTP 403
│
├── 3. Kiểm tra idempotency
│   └── payment.status === SUCCESS → return { activated: true }
│       (Đã xử lý trước đó, trả về luôn không làm gì thêm)
│
├── 4. Kiểm tra hết hạn
│   └── payment.expiredAt <= now → HTTP 422 "QR đã hết hạn"
│
├── 5. Lấy transactionCode từ vietqrPayload
│   └── Không có → HTTP 500
│
├── 6. ⚡ Acquire Redis Distributed Lock
│   │   Key: lock:payment:verify:{paymentId}
│   │   TTL: 20 giây
│   │   Cơ chế: SET NX PX 20000 (atomic)
│   │
│   ├── ❌ Lock KHÔNG lấy được (Cron đang xử lý)
│   │   ├── Đọc lại DB status
│   │   ├── Nếu SUCCESS → return { activated: true }
│   │   └── Nếu chưa → return { activated: false,
│   │       message: "Hệ thống đang xử lý..." }
│   │
│   └── ✅ Lock lấy được
│       │
│       ├── 7. Double-check DB (phòng cron vừa xong)
│       │   └── Nếu SUCCESS → release lock → return true
│       │
│       ├── 8. Gọi TnAppService.findTransactionByCode()
│       │   ├── TN App lỗi → release lock → HTTP 503
│       │   ├── Không tìm thấy → release lock →
│       │   │   return { activated: false }
│       │   └── ✅ Tìm thấy giao dịch khớp
│       │
│       ├── 9. DB Transaction
│       │   └── UPDATE payment SET status='success',
│       │       transactionId=..., paidAt=...
│       │
│       ├── 10. Emit Event: PAYMENT_SUCCESS
│       │   └── Payload: { paymentId, userId, transactionId }
│       │
│       └── finally: Release Redis Lock
│
▼
Response trả về FE
```

### Các response có thể nhận

**Thành công — tài khoản được kích hoạt:**
```json
{
  "activated": true,
  "message": "Tài khoản đã được kích hoạt thành công!"
}
```

**Chưa tìm thấy giao dịch — FE nên thử lại:**
```json
{
  "activated": false,
  "message": "Chưa tìm thấy giao dịch phù hợp. Vui lòng đợi vài giây rồi thử lại."
}
```

**Lock bị chiếm — Cron đang xử lý:**
```json
{
  "activated": false,
  "message": "Hệ thống đang xử lý giao dịch của bạn. Vui lòng thử lại sau vài giây."
}
```

**Các lỗi HTTP:**

| Status | Error Code | Khi nào | FE xử lý |
|---|---|---|---|
| 403 | PAYMENT_FORBIDDEN | paymentId không thuộc user | Hiển thị lỗi |
| 404 | PAYMENT_NOT_FOUND | paymentId không tồn tại | Hiển thị lỗi |
| 422 | PAYMENT_QR_EXPIRED | QR đã hết hạn | Gọi lại generate-qr |
| 503 | PAYMENT_VERIFY_SERVICE_UNAVAILABLE | TN App API down | Thử lại sau |

---

## 3. Kênh 2 — Cron Job Auto-Verify

### Trigger

```typescript
@Cron(CronExpression.EVERY_MINUTE)  // Chạy mỗi phút
async scanAndReconcile(): Promise<void>
```

### Luồng xử lý 6 bước

```
@Cron(EVERY_MINUTE) scanAndReconcile()
│
├── Bước 1: expireStaleActivations()
│   └── UPDATE payments SET status='expired'
│       WHERE status='pending' AND expired_at < NOW()
│   └── Dọn rác trước khi xử lý, tránh đối soát nhầm
│
├── Bước 2: resolveSyncWindow()
│   ├── Đọc Redis key: tn_last_sync_time
│   │   ├── Có giá trị → fromDate = last sync time
│   │   ├── Không có (lần đầu) → fromDate = now - 30 phút
│   │   └── Redis lỗi → fromDate = now - 30 phút (fallback)
│   └── toDate = now
│
├── Bước 3: TnAppService.fetchLatestBatch(fromDate, toDate)
│   ├── Gọi TN App API **1 LẦN DUY NHẤT**
│   ├── Lấy tối đa 50 giao dịch CREDIT gần nhất
│   ├── Nếu TN App lỗi → return [] (log error, KHÔNG crash cron)
│   └── Nếu 0 giao dịch → kết thúc sớm
│
├── Bước 4: updateLastSyncTime()
│   └── Lưu max(tx.transactionTime) vào Redis
│       để lần sau chỉ fetch giao dịch MỚI HƠN
│
├── Bước 5: findAllPendingActive(limit=20)
│   └── SELECT * FROM payments
│       WHERE status='pending'
│       AND payment_method='activation'
│       AND expired_at > NOW()
│       ORDER BY created_at ASC
│       LIMIT 20
│
└── Bước 6: Đối soát trong RAM
    │
    └── for (payment of pendingPayments)
        │
        ├── Lấy transactionCode từ vietqrPayload
        │   └── Không có → skip
        │
        ├── Tìm giao dịch khớp trong mảng transactions
        │   Điều kiện:
        │   - tx.narrative chứa transactionCode (case-insensitive)
        │   - tx.transactionAmount >= payment.amount
        │   └── Không khớp → skip
        │
        └── verifyAndProcessMatchedPayment(payment, matchedTx)
            │
            ├── Acquire Redis Lock: lock:payment:verify:{paymentId}
            │   └── Không lấy được → skip (API đang xử lý)
            │
            ├── UPDATE payment SET status='success', transaction_id=...
            │   └── Catch PG error 23505 (unique violation) → skip
            │       (giao dịch đã được xử lý bởi process khác)
            │
            ├── Emit Event: PAYMENT_SUCCESS
            │
            └── finally: Release Redis Lock
```

### Đặc điểm quan trọng

| Đặc điểm | Giá trị | Lý do |
|---|---|---|
| Tần suất | Mỗi phút | Cân bằng giữa độ trễ và tải API |
| TN App API call | **1 lần / chu kỳ** | Tránh N+1, tiết kiệm rate limit |
| Batch size | 20 records | Đủ cho MVP, không quá tải |
| Match logic | Trong RAM | Không cần thêm DB round-trip |
| Error handling | Log + skip | Cron **KHÔNG BAO GIỜ** crash |

---

## 4. Kênh 3 — Event Listener (Decoupled)

### Cơ chế

```
PaymentService / PaymentVerificationService
    │
    │  eventEmitter.emit('payment.success', {
    │    paymentId, userId, transactionId
    │  })
    │
    ▼
PaymentSuccessListener
    │
    │  @OnEvent('payment.success')
    │  handlePaymentSuccess(payload)
    │
    │  UPDATE users SET is_verified = true WHERE id = userId
    │
    ▼
User được kích hoạt ✅
```

### Tại sao dùng Event thay vì update trực tiếp?

| | Update trực tiếp (cũ) | Event-Driven (hiện tại) |
|---|---|---|
| Code | PaymentService import UserEntity | PaymentService chỉ emit event |
| Coupling | Payment **biết** về User | Payment **không biết** User tồn tại |
| Mở rộng | Thêm feature → sửa PaymentService | Thêm listener mới, **không đụng** payment code |
| Ví dụ | — | Sau này thêm: gửi email, push notification → chỉ thêm listener |

---

## 5. Chống Race Condition — Redis Distributed Lock

### Vấn đề

Cả API (Kênh 1) và Cron (Kênh 2) có thể xử lý **cùng 1 paymentId** tại **cùng 1 thời điểm**.

### Giải pháp: 2 lớp bảo vệ

**Lớp 1 — Redis Lock (phòng tuyến đầu):**
```
Key:     lock:payment:verify:{paymentId}
TTL:     20 giây
Cơ chế:  SET NX PX 20000 (atomic — không thể 2 process cùng SET thành công)
Value:   "api" hoặc "cron" (để debug biết ai đang giữ lock)
```

**Lớp 2 — PostgreSQL Unique Constraint (phòng tuyến cuối):**
```sql
-- payment.entity.ts
@Column({ name: 'transaction_id', unique: true, nullable: true })
transactionId: string | null;
```
Nếu lock thất bại → 2 process cùng match 1 `tx.id` → process thứ 2 bị PG reject với error code **23505** → catch → skip.

### Ma trận các tình huống

| Tình huống | API | Cron | Kết quả |
|---|---|---|---|
| API trước, Cron sau | ✅ Xử lý | Skip (lock bị chiếm) | ✅ OK |
| Cron trước, API sau | Đọc DB → return kết quả | ✅ Xử lý | ✅ OK |
| Cả 2 cùng lúc | Ai SET NX trước thắng | Người kia skip | ✅ OK |
| Process crash | — | — | Lock tự expire sau 20s | ✅ OK |
| Duplicate tx.id | PG 23505 → catch → skip | PG 23505 → catch → skip | ✅ OK |

---

## 6. Sơ Đồ Luồng Toàn Bộ (End-to-End)

```
FE                     API Server                    Cron Job              TN App          Redis           PostgreSQL
│                         │                             │                    │               │                │
│── POST generate-qr ────>│                             │                    │               │                │
│                         │── INSERT payment (PENDING) ──────────────────────────────────────────────────────>│
│<── { paymentId, qrUrl } │                             │                    │               │                │
│                         │                             │                    │               │                │
│  [User mở app ngân hàng │                             │                    │               │                │
│   quét QR, chuyển khoản]│                             │                    │               │                │
│                         │                             │                    │               │                │
│── POST /verify ────────>│                             │                    │               │                │
│                         │── SET NX lock:{id} ─────────────────────────────────────────────>│                │
│                         │<── OK ──────────────────────────────────────────────────────────│                │
│                         │── findTransactionByCode() ──────────────────────>│               │                │
│                         │<── { found: true, tx } ─────────────────────────│               │                │
│                         │── BEGIN TRANSACTION ─────────────────────────────────────────────────────────────>│
│                         │── UPDATE payment → SUCCESS ──────────────────────────────────────────────────────>│
│                         │── COMMIT ────────────────────────────────────────────────────────────────────────>│
│                         │── DEL lock:{id} ─────────────────────────────────────────────────>│               │
│                         │── emit(PAYMENT_SUCCESS) ──>│                    │               │                │
│                         │                           │── UPDATE user ──────────────────────────────────────>│
│<── { activated: true } ─│                             │                    │               │                │
│                         │                             │                    │               │                │
│                         │                    @Cron(EVERY_MINUTE)           │               │                │
│                         │                             │── GET tn_last_sync ────────────────>│               │
│                         │                             │<── fromDate ───────────────────────│               │
│                         │                             │── fetchLatestBatch() ──────────────>│               │
│                         │                             │<── transactions[] ─────────────────│               │
│                         │                             │── SET tn_last_sync ────────────────>│               │
│                         │                             │── findAllPendingActive() ──────────────────────────>│
│                         │                             │<── pendingPayments[] ──────────────────────────────│
│                         │                             │── [match trong RAM]  │               │              │
│                         │                             │── SET NX lock:{id} ─────────────────>│              │
│                         │                             │── UPDATE payment ───────────────────────────────────>│
│                         │                             │── DEL lock:{id} ────────────────────>│              │
│                         │                             │── emit(PAYMENT_SUCCESS)             │               │
│                         │                             │── UPDATE user ──────────────────────────────────────>│
```

---

## 7. Danh Sách File Liên Quan

| File | Vai trò |
|---|---|
| `services/payment.service.ts` | API thủ công — verifyActivationPayment() |
| `services/payment-verification.service.ts` | Cron job — scanAndReconcile() |
| `services/tn-app.service.ts` | Gọi API ngân hàng — findTransactionByCode() + fetchLatestBatch() |
| `services/vietqr.service.ts` | Tạo URL QR |
| `repositories/payment.repository.ts` | Data access — findAllPendingActive(), expireStaleActivations() |
| `entities/payment.entity.ts` | DB schema — UNIQUE constraint trên transaction_id |
| `events/payment.events.ts` | Event constants — PAYMENT_SUCCESS_EVENT |
| `listeners/payment-success.listener.ts` | Kích hoạt user khi payment success |
| `payment.utils.ts` | Hàm dùng chung — parseVNTime(), toVNDateString() |
| `payment.controller.ts` | HTTP endpoints + Swagger docs |
| `payment.module.ts` | DI container — ScheduleModule, EventEmitterModule |
