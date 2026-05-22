# 🔐 API Kích Hoạt Tài Khoản Mentee

> **Base URL:** `/api/v1/payments`  
> **Authentication:** Tất cả endpoint đều yêu cầu JWT hợp lệ (gửi qua cookie `access_token` hoặc header `Authorization: Bearer <token>`).

---

## Tổng quan luồng hoạt động

```
FE                          Backend                     Cron Job (mỗi phút)
│                             │                              │
│── POST generate-qr ────────>│                              │
│<─ { paymentId, qrUrl } ─────│                              │
│                             │                              │
│  [User chuyển khoản]        │                              │
│                             │                              │
│── POST verify (bấm nút) ──>│                              │
│                             │── Redis Lock ──>             │
│                             │── Gọi TN App ──>             │
│                             │── Update DB ──>              │
│                             │── Emit Event ──>             │
│<─ { activated: true } ──────│                              │
│                             │                              │
│                             │<── scanAndReconcile() ───────│
│                             │<── Fetch TN App (1 lần) ─────│
│                             │<── Match + Redis Lock ───────│
│                             │<── Update DB + Emit Event ───│
```

> **Dual-Sync:** Endpoint `/verify` gọi TN App API **trực tiếp** (active-fetch). Song song đó, cron job chạy mỗi phút để catch user quên bấm nút. Cả 2 kênh đều dùng Redis Lock để chống race condition.

---

## 1. Tạo mã QR kích hoạt

### `POST /api/v1/payments/activation/generate-qr`

Tạo hoặc lấy lại mã QR VietQR để mentee thanh toán phí kích hoạt tài khoản.  
Nếu đã có QR **còn hạn**, backend trả về QR cũ (không tạo mới).  
Nếu QR cũ **đã hết hạn**, backend tự động expire QR đó và tạo QR mới.

### Request

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:** _(không bắt buộc — gửi `{}` hoặc để trống)_

### Response — `201 Created`

```json
{
  "data": [
    {
      "paymentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": 10000,
      "transactionCode": "KICHHOAT 42ABCD",
      "qrUrl": "https://img.vietqr.io/image/TCB-123456789-compact2.png?amount=10000&addInfo=KICHHOAT+42ABCD&accountName=...",
      "expiredAt": "2026-05-13T04:45:00.000Z"
    }
  ],
  "meta": {},
  "error": null
}
```

| Field | Type | Mô tả |
|---|---|---|
| `paymentId` | `string` (UUID) | ID của payment record — dùng để gọi `/verify` và `/payments/:id` |
| `amount` | `number` | Số tiền cần chuyển khoản (VND) |
| `transactionCode` | `string` | Nội dung chuyển khoản — **bắt buộc nhập đúng** khi chuyển khoản |
| `qrUrl` | `string` | URL ảnh QR VietQR — nhúng vào `<img src="...">` là hiển thị được ngay |
| `expiredAt` | `string` (ISO 8601, UTC) | Thời điểm QR hết hạn |

> ⚠️ `expiredAt` trả về theo **UTC**. FE cần cộng thêm +7 giờ trước khi hiển thị cho user Việt Nam.  
> ⏱️ QR có hiệu lực **15 phút** kể từ lúc tạo.

### Các lỗi có thể xảy ra

| HTTP Status | Error Code | Thông báo | Hành động FE |
|---|---|---|---|
| `401 Unauthorized` | `UNAUTHORIZED` | — | Redirect về trang đăng nhập |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | — | Hiển thị thông báo lỗi chung |

---

## 2. Xác minh thanh toán (Dual-Sync)

### `POST /api/v1/payments/activation/verify`

User bấm **"Tôi đã chuyển khoản"** → FE gọi endpoint này để xác minh ngay lập tức.

**Cơ chế hoạt động (Dual-Sync):**
Hệ thống có **2 kênh** xử lý song song, được bảo vệ bởi Redis Distributed Lock:

1. **Kênh API (Active-Fetch):** Endpoint này gọi TN App API **trực tiếp** để kiểm tra giao dịch. User nhận kết quả ngay lập tức mà không cần chờ cron.
2. **Kênh Cron (Background):** Cron job chạy mỗi phút quét tất cả payment PENDING, gọi TN App 1 lần rồi match trong RAM. Dành cho user chuyển khoản xong rồi tắt app / quên bấm nút.

➡️ **FE gọi verify khi user bấm nút.** Nếu `activated: false`, có thể polling mỗi 5–10 giây hoặc đợi user bấm lại.

### Request

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

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `paymentId` | `string` | ✅ | ID lấy từ response của bước Generate QR |

### Response — `201 Created`

**Trường hợp 1 — Giao dịch xác nhận thành công → Kích hoạt tài khoản**
```json
{
  "data": [
    {
      "activated": true,
      "message": "Tài khoản đã được kích hoạt thành công!"
    }
  ],
  "meta": {},
  "error": null
}
```
➡️ FE nhận `activated: true` → chuyển user đến trang chủ / dashboard.

---

**Trường hợp 2 — Chưa tìm thấy giao dịch → Thử lại sau**
```json
{
  "data": [
    {
      "activated": false,
      "message": "Chưa tìm thấy giao dịch phù hợp. Vui lòng đợi vài giây rồi thử lại."
    }
  ],
  "meta": {},
  "error": null
}
```
➡️ HTTP vẫn là `201`, **đây không phải lỗi**. FE đợi vài giây rồi cho user bấm lại hoặc polling.

---

**Trường hợp 3 — Cron đang xử lý (lock bị chiếm)**
```json
{
  "data": [
    {
      "activated": false,
      "message": "Hệ thống đang xử lý giao dịch của bạn. Vui lòng thử lại sau vài giây."
    }
  ],
  "meta": {},
  "error": null
}
```
➡️ Cron job đang xác minh đúng paymentId này. FE đợi 3–5 giây rồi gọi lại.

---

### Các lỗi (HTTP khác 2xx)

```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "PAYMENT_QR_EXPIRED",
    "message": "Mã QR đã hết hạn, vui lòng tạo mã mới và chuyển khoản lại.",
    "traceId": "...",
    "details": null
  }
}
```

| HTTP Status | Error Code | Thông báo | Hành động FE |
|---|---|---|---|
| `401 Unauthorized` | `UNAUTHORIZED` | — | Redirect về trang đăng nhập |
| `403 Forbidden` | `PAYMENT_FORBIDDEN` | "Bạn không có quyền xác minh thanh toán này." | Hiển thị lỗi, không cho retry |
| `404 Not Found` | `PAYMENT_NOT_FOUND` | "Không tìm thấy thông tin thanh toán." | Hiển thị lỗi |
| `422 Unprocessable Entity` | `PAYMENT_QR_EXPIRED` | "Mã QR đã hết hạn, vui lòng tạo mã mới và chuyển khoản lại." | Xóa QR cũ → gọi lại Generate QR |
| `503 Service Unavailable` | `PAYMENT_VERIFY_SERVICE_UNAVAILABLE` | "Không thể kết nối đến dịch vụ kiểm tra giao dịch." | Thử lại sau 5–10 giây |

---

## 3. Lấy thông tin chi tiết một payment

### `GET /api/v1/payments/:id`

Tra cứu trạng thái hoặc chi tiết của một payment record.  
Có thể dùng sau khi nhận `activated: true` để xác nhận thêm thông tin giao dịch.

### Request

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Mô tả |
|---|---|---|
| `id` | `string` (UUID) | ID của payment (lấy từ `paymentId` ở bước Generate QR) |

### Response — `200 OK`

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "12",
      "amount": "10000.00",
      "currency": "VND",
      "status": "success",
      "paymentMethod": "activation",
      "description": "KICHHOAT 42ABCD",
      "transactionId": "TN-TX-20260513-001",
      "paidAt": "2026-05-13T02:15:00.000Z",
      "expiredAt": "2026-05-13T02:30:00.000Z",
      "createdAt": "2026-05-13T02:00:00.000Z",
      "updatedAt": "2026-05-13T02:15:05.000Z"
    }
  ],
  "meta": {},
  "error": null
}
```

**Giá trị field `status`:**

| Giá trị | Ý nghĩa |
|---|---|
| `pending` | Đang chờ thanh toán — cron chưa tìm thấy giao dịch khớp |
| `success` | Cron đã xác nhận giao dịch — tài khoản đã được kích hoạt |
| `expired` | QR hết hạn — user cần tạo QR mới |
| `failed` | Thanh toán thất bại |

### Các lỗi có thể xảy ra

| HTTP Status | Error Code | Mô tả |
|---|---|---|
| `401 Unauthorized` | `UNAUTHORIZED` | Token không hợp lệ hoặc hết hạn |
| `404 Not Found` | `PAYMENT_NOT_FOUND` | Không tìm thấy payment với ID này |

---

## Gợi ý implement FE (Dual-Sync Flow)

```typescript
// Bước 1: Tạo QR
const { data } = await api.post('/payments/activation/generate-qr');
const { paymentId, qrUrl, expiredAt, transactionCode } = data.data[0];

// Bước 2: Hiển thị QR + thông tin chuyển khoản cho user

// Bước 3: User bấm "Tôi đã chuyển khoản" → gọi verify NGAY LẬP TỨC
const handleVerify = async () => {
  try {
    const res = await api.post('/payments/activation/verify', { paymentId });
    const result = res.data.data[0];

    if (result.activated) {
      // Kích hoạt thành công → redirect
      router.push('/dashboard');
      return;
    }

    // activated: false → chưa tìm thấy hoặc cron đang xử lý
    // Hiển thị thông báo cho user, cho phép bấm lại sau vài giây
    showMessage(result.message);
  } catch (err) {
    if (err.response?.status === 422) {
      // QR hết hạn → tạo QR mới
      await regenerateQr();
    } else if (err.response?.status === 503) {
      // TN App tạm lỗi → thử lại
      showMessage('Hệ thống đang bận, vui lòng thử lại sau.');
    }
  }
};

// Bước 4 (tùy chọn): Auto-polling sau khi bấm nút
// Cron job chạy ngầm mỗi phút, FE poll để kiểm tra kết quả
const startPolling = () => {
  const poll = setInterval(async () => {
    try {
      const res = await api.post('/payments/activation/verify', { paymentId });
      if (res.data.data[0].activated) {
        clearInterval(poll);
        router.push('/dashboard');
      }
    } catch {
      clearInterval(poll);
    }
  }, 7000); // polling mỗi 7 giây

  // Tự dừng khi QR hết hạn
  setTimeout(() => clearInterval(poll), new Date(expiredAt) - Date.now());
};
```

> 💡 **Khuyến nghị:** Hiển thị countdown timer từ `expiredAt` để user biết còn bao nhiêu thời gian. Nếu hết giờ trước khi nhận được `activated: true`, tự động gọi lại `generate-qr` để tạo QR mới.
