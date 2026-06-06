# Chuẩn hóa Logging & Truy vết Request (Correlation ID)

Tài liệu này giải thích lý do, luồng hoạt động và lợi ích của việc thay thế hệ thống `console.log` (TraceID) cũ bằng hệ thống **Structured Logging + Correlation ID** chuẩn Production.

---

## 1. Tại sao phải thay thế TraceID cũ?

*   **Rác log & Mù thông tin:** Dùng `console.log` thuần túy khiến log bị trộn lẫn khi có hàng chục request tới cùng lúc. Bạn không thể biết dòng log lỗi `[ERROR] Cannot save user` thuộc về ai.
*   **Máy móc không hiểu được text:** Các hệ thống giám sát server (Datadog, Kibana, AWS CloudWatch) không thể query nhanh trên log text tự do. Chúng cần định dạng JSON (`Structured Logging`) với các field rõ ràng (như `{ "userId": 123, "level": "error" }`).
*   **Prop Drilling (Hỏng cấu trúc code):** Nếu muốn truyền ID từ Controller xuống tận DB Repository để log, bạn phải sửa tham số của hàng loạt hàm. Cực kỳ rườm rà và vi phạm Clean Code.

**👉 Giải pháp:** Dùng **Correlation ID** kết hợp `AsyncLocalStorage` và **NestJS Logger**.

---

## 2. So sánh Trực quan: Phiên bản Cũ vs Mới

### ❌ Phiên bản Cũ (Dùng `console.log` và TraceID thủ công)
Phiên bản cũ **đã có** sinh ra `traceId` trong Middleware, nhưng cách nó in ra màn hình lại dùng các khối `console.log` khổng lồ và **bị mất dấu traceId** khi đi vào sâu trong Service:
```text
============== [REQUEST] [req-abcd-1234] ==============
GET /courses
Body: {
  // Toàn bộ body nhạy cảm bị in ra đây
}
====================================================

[Nest] 12345  - 06/06/2026, 10:00:00 AM     LOG [CourseService] Fetching course list...  <-- Đã mất tích TraceID ở Service!
[Nest] 12345  - 06/06/2026, 10:00:01 AM   ERROR [CourseService] Database connection failed <-- Của request nào vừa nãy???
```
*Hậu quả: Lộ dữ liệu nhạy cảm ở Middleware, rác màn hình vì in quá dài, và hoàn toàn đứt gãy thông tin (mất dấu ID) khi xuống tới Controller/Service do không dùng Context.*

### ✅ Phiên bản Mới (Môi trường Development)
Log được gắn chặt với **Correlation ID**. Dù có hàng nghìn request chạy song song, bạn vẫn dễ dàng nhặt ra đúng luồng mình cần:
```text
[req-abcd-1234] [REQUEST] GET /courses
[req-9999-xyzz] [REQUEST] GET /courses
[req-abcd-1234] [CourseService] findAll -> entry
[req-9999-xyzz] [CourseService] findAll -> entry
[req-abcd-1234] [CourseService] [ERROR] Database connection failed
```
*Kết quả: Chỉ cần nhìn ID `req-abcd-1234`, bạn biết chính xác request nào vừa sập và luồng đi của nó.*

### 🚀 Phiên bản Mới (Môi trường Production)
Thay vì in text có màu (các cỗ máy không đọc được màu), hệ thống tự ép sang JSON nguyên thủy:
```json
{"level":"info","correlationId":"req-abcd-1234","context":"CorrelationIdMiddleware","method":"GET","url":"/courses","message":"[REQUEST]"}
{"level":"error","correlationId":"req-abcd-1234","context":"CourseService","message":"Database connection failed","stack":"Error: Database..."}
```
*Kết quả: Ném cục log này vào Datadog hoặc ElasticSearch, bạn có thể gõ Query tìm kiếm: `level="error" AND correlationId="req-abcd-1234"` ra ngay tắp lự!*

---

## 3. Luồng hoạt động (The Flow)

1.  **Chặn cổng (Middleware):** Khi 1 Request đi vào, `CorrelationIdMiddleware` sẽ chộp lấy nó. Nó kiểm tra xem Header có `x-correlation-id` không, nếu không nó tự sinh ra một UUID mới.
2.  **Khởi tạo Context (AsyncLocalStorage):** ID này được tống vào `AsyncLocalStorage`. Đây là một khoang chứa "vô hình" của Node.js, duy trì trạng thái xuyên suốt vòng đời của 1 request duy nhất.
3.  **Ghi Log (AppLogger):** Khi Controller, Service hay Repository gọi `this.logger.info()`, thằng `AppLogger` tự động thò tay vào `AsyncLocalStorage` lấy cái ID kia ra và đính kèm vào payload. Code nghiệp vụ (Service) hoàn toàn không biết sự tồn tại của cái ID này.
4.  **Trả kết quả & Báo lỗi:** Dù request thành công hay thất bại (văng Exception), hệ thống luôn đính kèm Correlation ID vào Response Header (`X-Correlation-Id`) và Response Body JSON để trả về cho Client.

---

## 4. Lợi ích mang lại

*   **Tuyệt đối không lạc mất dấu vết:** Khi Frontend báo "Tao gọi API mua hàng bị lỗi 500", họ chỉ cần quăng cho bạn cái Correlation ID. Bạn mang ID đó ném vào thanh search của hệ thống Log là ra toàn bộ vòng đời của đúng cái request đó, từ lúc chui vào Controller đến lúc chết gục ở Repository.
*   **Clean Code:** Code Service của bạn "sạch bong", không bị vấy bẩn bởi tham số `log` hay `traceId` thừa thãi.
*   **Tương thích Production:** Log được ép định dạng sang JSON thô không màu khi `NODE_ENV=production`, hoàn toàn chuẩn SEO cho mọi cỗ máy đọc Log hiện đại nhất. Môi trường Dev thì vẫn giữ màu sắc thân thiện với Developer.

---

## 5. Hướng dẫn Test thực tế khi xảy ra sự cố

Hãy tự mình đóng vai một User gặp lỗi và Developer đi sửa lỗi:

### Bước 1: Mô phỏng lỗi
Dùng Postman gọi API `POST /api/v1/courses` nhưng **cố tình không truyền Token (hoặc body sai)** để ép hệ thống văng lỗi 401 hoặc 400.

### Bước 2: Phản ứng của User
Bạn sẽ nhận được cục JSON báo lỗi như sau:
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized",
    "correlationId": "req-9876-abcd-1234...",
    "details": null
  }
}
```
Lúc này, bạn copy cái mã `"req-9876-abcd-1234..."` kia lại.

### Bước 3: Phản ứng của Developer
Là một Backend Dev, bạn nhận được cái ID từ User báo cáo lên. 
1. Mở Terminal (nơi đang chạy `npm run start:dev`).
2. Bấm `Ctrl + F` (hoặc dùng bộ lọc trên Kibana/Datadog) và paste cái ID `"req-9876-abcd-1234..."` vào.
3. **BÙM!** Toàn bộ vết tích (stack trace, thông số gửi lên, bị chặn ở đâu) của đúng cái request xui xẻo đó hiện ra chi tiết, tách biệt hoàn toàn khỏi hàng tá request đang chạy mượt mà của những người khác. Sửa lỗi chỉ trong 1 nốt nhạc!
