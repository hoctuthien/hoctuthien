# Tiêu chuẩn API Request & Response

Tài liệu này quy định các tiêu chuẩn về dữ liệu đầu vào (Request) và đầu ra (Response) cho toàn bộ hệ thống backend. Việc tuân thủ tiêu chuẩn này giúp đảm bảo tính nhất quán giữa frontend và backend, đồng thời dễ dàng bảo trì và mở rộng.

---

## 1. Tiêu chuẩn Request

### 1.1. HTTP Methods
Sử dụng đúng ý nghĩa của các phương thức HTTP:
- **GET**: Lấy dữ liệu (không thay đổi trạng thái server).
- **POST**: Tạo mới dữ liệu.
- **PUT**: Cập nhật toàn bộ hoặc phần lớn dữ liệu hiện có.
- **PATCH**: Cập nhật một phần dữ liệu.
- **DELETE**: Xóa dữ liệu.

### 1.2. Headers
- `Content-Type: application/json`: Mọi request body phải là JSON.
- `Authorization: Bearer <token>`: Dùng cho các API yêu cầu xác thực.
- `x-trace-id` (Tùy chọn): Frontend có thể gửi mã này để trace lỗi xuyên suốt. Nếu không gửi, backend sẽ tự sinh.

### 1.3. JSON Body (Snake Case vs Camel Case)
- **Chuẩn hóa**: Sử dụng `camelCase` cho tất cả các field trong JSON body.
```json
{
  "firstName": "Nguyen",
  "lastName": "An",
  "phoneNumber": "0912345678"
}
```

---

## 2. Tiêu chuẩn Response

Mọi API JSON phải trả về dữ liệu được bọc trong một cấu trúc chuẩn thông qua Interceptor và Exception Filter.

### 2.1. Success Response (Đơn lẻ hoặc Object)
Áp dụng cho các API trả về một đối tượng hoặc kết quả thành công đơn giản.

**Cấu trúc:**
```json
{
  "success": true,
  "message": "Thông điệp mô tả (nếu có)",
  "data": { ... } // Dữ liệu trả về
}
```

### 2.2. Success Response (Danh sách - Không phân trang)
Áp dụng cho các API trả về một mảng dữ liệu cố định hoặc ngắn.

**Cấu trúc:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ]
}
```

### 2.3. Paginated Response (Danh sách - Có phân trang)
Áp dụng cho các API danh sách dài cần phân trang (ví dụ: Danh sách khóa học, danh sách người dùng).

**Cấu trúc:**
```json
{
  "success": true,
  "data": [ ... ], // Danh sách item của trang hiện tại
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 2.4. Error Response (Chuẩn hóa lỗi)
Mọi lỗi (4xx, 5xx) đều được trả về theo cấu trúc lỗi duy nhất.

**Cấu trúc:**
```json
{
  "error": {
    "code": "ERROR_CODE", // Mã lỗi để frontend xử lý logic (ví dụ: VALIDATION_FAILED)
    "message": "Mô tả lỗi dễ hiểu cho người dùng",
    "traceId": "req-123-abc", // Mã để dev tìm log trong hệ thống
    "details": { ... } // (Tùy chọn) Chi tiết lỗi theo từng field (dành cho lỗi validate)
  }
}
```

### 2.5. Phản hồi sau khi thay đổi dữ liệu (Mutation Response)
Đối với các phương thức thay đổi trạng thái dữ liệu (**POST**, **PUT**, **PATCH**), backend **BẮT BUỘC** trả về dữ liệu mới nhất (đã được cập nhật trong DB) trong field `data`.
- **Lợi ích**: Frontend có thể cập nhật ngay giao diện hoặc cache mà không cần tốn thêm một request `GET` để lấy lại dữ liệu vừa thay đổi.

---

## 3. Sự minh bạch về Kiểu dữ liệu và "Null Safety"

Để frontend dễ dàng làm việc và tránh các lỗi runtime không đáng có, backend cần tuân thủ các quy tắc sau:

### 3.1. Danh sách (Arrays)
Nếu không có dữ liệu, **BẮT BUỘC** trả về mảng rỗng `[]`. Tuyệt đối không trả `null` hay bỏ field đó khỏi response.
- **Lợi ích**: Frontend có thể gọi trực tiếp các hàm như `.map()`, `.length`, `.filter()` mà không cần check logic phức tạp, giúp code sạch hơn và hạn chế Exception.

### 3.2. Kiểu dữ liệu cố định (Fixed Types)
Các trường định danh hoặc thuộc tính cốt lõi phải có kiểu dữ liệu nhất quán trong toàn bộ hệ thống.
- **Id**: Luôn là chuỗi (`String` - ví dụ UUID) hoặc luôn là số (`Number`). Không được phép lúc trả về string, lúc trả về number cho cùng một loại tài nguyên.

### 3.3. Trạng thái (Enums)
Không sử dụng **Magic Numbers** cho các trường trạng thái (ví dụ: `status: 1, 2, 3`).
- **Quy tắc**: Trả về chuỗi Enums (ví dụ: `status: "ACTIVE" | "PENDING" | "BANNED"`).
- **Lợi ích**: Code frontend dễ đọc như một câu văn tiếng Anh, đồng thời TypeScript hỗ trợ Union Types cực tốt để bắt lỗi ngay khi code.

---

## 4. Tiêu chuẩn Phân trang (Pagination)

Hệ thống sử dụng cơ chế phân trang theo **Offset-based pagination** (dùng `page` và `limit`).

### 4.1. Request Parameters (Query String)
Khi gọi API danh sách có phân trang, frontend cần gửi:
- `page`: Số trang muốn lấy (bắt đầu từ **1**). Mặc định là `1`.
- `limit`: Số lượng item trên một trang. Mặc định là `10`. Tối đa là `100`.
- `sortBy` (Tùy chọn): Field dùng để sắp xếp (ví dụ: `createdAt`).
- `sortOrder` (Tùy chọn): Thứ tự sắp xếp `ASC` (tăng dần) hoặc `DESC` (giàm dần). Mặc định là `DESC`.

**Ví dụ:** `GET /v1/users?page=1&limit=20&sortBy=createdAt&sortOrder=DESC`

### 4.2. Response Meta (`pagination` object)
Backend phải trả về đủ 4 thông số:
- `page`: Trang hiện tại.
- `limit`: Số item yêu cầu trên mỗi trang.
- `total`: Tổng số item hiện có trong database thỏa mãn điều kiện lọc.
- `totalPages`: Tổng số trang (tính bằng `ceil(total / limit)`).

---

## 5. Các mã trạng thái HTTP Common

| Mã lỗi | Tên | Ý nghĩa |
|---|---|---|
| **200** | OK | Request thành công. |
| **201** | Created | Tạo mới thành công (thường dùng cho POST). |
| **204** | No Content | Thành công nhưng không trả về data (thường dùng cho DELETE). |
| **400** | Bad Request | Dữ liệu đầu vào sai (lỗi validate). |
| **401** | Unauthorized | Chưa đăng nhập hoặc token hết hạn. |
| **403** | Forbidden | Đã đăng nhập nhưng không có quyền truy cập tài nguyên. |
| **404** | Not Found | Không tìm thấy tài nguyên (User không tồn tại, v.v.). |
| **409** | Conflict | Xung đột dữ liệu (Email đã tồn tại, v.v.). |
| **500** | Internal Server Error | Lỗi hệ thống backend (Crash, DB down). |

---

## 6. Quy tắc đặt mã lỗi (`code`)

Mã lỗi trong object `error.code` nên được đặt theo quy tắc in hoa, nối bằng dấu gạch dưới:

- `VALIDATION_FAILED`: Lỗi dữ liệu không đúng định dạng.
- `UNAUTHORIZED`: Lỗi xác thực.
- `PERMISSION_DENIED`: Lỗi phân quyền.
- `NOT_FOUND`: Tài nguyên không tồn tại.
- `ALREADY_EXISTS`: Tài nguyên đã tồn tại (trùng email, v.v.).
- `INTERNAL_SERVER_ERROR`: Lỗi không xác định từ server.

---

## 7. Ví dụ Luồng Request/Response

### Request mẫu
`GET /v1/notifications?page=1&limit=2`

### Response thành công (Paginated)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "title": "Chào mừng!",
      "status": "READ",
      "content": "Chào mừng bạn gia nhập hệ thống."
    },
    {
      "id": "uuid-2",
      "title": "Cập nhật hồ sơ",
      "status": "UNREAD",
      "content": "Hãy bổ sung thông tin hồ sơ của bạn."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 50,
    "totalPages": 25
  }
}
```

### Response lỗi (Validation)
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Thông tin đăng ký không hợp lệ",
    "traceId": "req-999-xyz",
    "details": {
      "email": "Email không đúng định dạng",
      "password": "Mật khẩu phải có ít nhất 8 ký tự"
    }
  }
}
```
