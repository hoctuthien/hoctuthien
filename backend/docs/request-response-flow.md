# Luồng request/response hiện tại trong backend MentorConnect

Tài liệu này mô tả luồng thực tế hiện tại của backend, dựa trên code đang có ở `main.ts`, `AppModule`, interceptor và exception filter.

## 1. Điểm vào của ứng dụng

File khởi động là `src/main.ts`.

Nó làm 3 việc chính:

- tạo Nest application từ `AppModule`
- bật `ValidationPipe` ở mức global
- gắn global exception filter để chuẩn hóa lỗi

### `main.ts` hiện tại đang giữ gì

Hiện tại `main.ts` đang giữ:

- `useGlobalPipes(...)`
- `useGlobalFilters(...)`

Và không giữ interceptor response thành công trực tiếp trong file này.

Lý do là interceptor đang được thiết kế để chạy global ở tầng module / provider, chứ không nhất thiết phải bootstrap trực tiếp trong `main.ts`.

## 2. Ứng dụng được ghép từ `AppModule`

File `src/app.module.ts` là root module.

Nó gom các module chức năng như:

- `DatabaseModule`
- `UserModule`
- `UserSessionModule`

Nhiệm vụ của `AppModule` là:

- khai báo module gốc của app
- nối các module nghiệp vụ với nhau
- cung cấp dependency injection cho toàn hệ thống

## 3. Request đi qua backend theo thứ tự nào

Luồng chung là:

1. Client gửi request
2. Middleware / context request được set lên nếu có
3. `ValidationPipe` kiểm tra input
4. Controller nhận request hợp lệ
5. Service xử lý nghiệp vụ
6. Repository thao tác database
7. Response đi ngược lại qua interceptor hoặc exception filter
8. Client nhận response cuối cùng

## 4. TraceId Middleware (Cơ chế lấy và lưu TraceId)

TraceId đặc biệt quan trọng để định danh một request, giúp ích rất nhiều trong quá trình ghi log (logging) và trace lỗi (debugging) khi hệ thống phức tạp.

**File xử lý chính:** `src/common/middlewares/trace-id.middleware.ts`

### Nguồn gốc của TraceId (Lấy ở đâu?)
- Ngay khi request vừa đến ứng dụng (nằm ở bước ngoài cùng, trước khi vào Validation hay Controller), Node.js sẽ cho chạy qua `TraceIdMiddleware`.
- **Lấy từ Request Header (Ưu tiên số 1):** Nếu Frontend / Client chủ động định danh request và truyền lên giá trị thông qua HTTP Header tên là `x-trace-id`, Middleware sẽ lập tức trích xuất header này và lấy nó để dùng làm mã `traceId` (ví dụ `x-trace-id: req-from-mobile-01`).
- **Tự động sinh (Dự phòng):** Nếu không cấu hình Header `x-trace-id`, hệ thống tự giác mượn hàm `randomUUID` của Node sinh ra một chuỗi định danh duy nhất (ví dụ: `req-7e452a87-c200-4...`).

### Cách lưu chuyển & Truyền tải (Lưu như thế nào?)
- **Lưu động trên RAM (Vòng đời của Request):** Mã `traceId` **hoàn toàn không được lưu xuống CSDL (Database)**. Thay vào đó, sau khi Middleware xác định được mã, nó sẽ đính kèm (attach/inject) thẳng thuộc tính có tên `traceId` vào đối tượng `Request` (Express context) chuẩn bị đi vào sâu trong các hàm:
  ```typescript
  req.traceId = ... // giá trị chuỗi id
  ```
- Nhờ gắn biến global vào Request context, từ các tầng sau (Controller, Service, Filter), lập trình viên chỉ cần trích xuất thuộc tính `request.traceId` ra là có thể sử dụng (ví dụ in ra Log).
- **Trả về đầu cuối nhờ HttpExceptionFilter:** Đối với các luồng bị bẻ gãy do báo lỗi, `HttpExceptionFilter` sẽ lấy trực tiếp `traceId` từ bên trong đối tượng request và nhét nó vào response error body cho client:
  ```json
  {
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "...",
      "traceId": "req-9876-abc-123" // XUẤT HIỆN Ở ĐÂY
    }
  }
  ```
Quy trình này hình thành nên một vòng khép kín: Có lỗi -> Trả User `traceId` -> User đưa ID -> Dev dùng nó lục tung cơ sở Log là sẽ ra điểm bị lỗi.

## 5. Validation pipe toàn cục

File: `src/main.ts`

Đang dùng:

- `ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })`

Nó làm các việc:

- biến đổi input về đúng kiểu nếu cần
- chỉ cho phép field nằm trong DTO/schema
- chặn field thừa
- ném lỗi 400 nếu dữ liệu sai

Đây là phần nên đặt global vì mọi request nhập liệu đều cần kiểm tra trước khi vào controller.

## 6. Controller

Controller nhận dữ liệu sau khi đã qua validation.

Nhiệm vụ:

- map route
- đọc `body`, `param`, `query`
- gọi service
- trả kết quả thô

Controller không nên tự bọc response hay tự format lỗi.

## 7. Service

Service là nơi xử lý nghiệp vụ.

Nó quyết định:

- dữ liệu nào đúng
- dữ liệu nào sai
- khi nào phải ném lỗi

Ví dụ:

- không tìm thấy user → `NotFoundException`
- dữ liệu bị trùng → `ConflictException`
- đăng nhập sai → `UnauthorizedException`

## 8. Repository

Repository là lớp truy cập database.

Nhiệm vụ:

- create
- find
- update
- delete

Repository không nên biết gì về format response HTTP.

## 9. Response thành công vẫn là global interceptor

Bạn muốn interceptor cho các request không lỗi — điều đó là đúng hướng.

File hiện tại xử lý response thành công là:

- `src/common/interceptors/response-transform.interceptor.ts`

Interceptor này có nhiệm vụ:

- lấy data trả về từ controller/service
- bọc thành response chuẩn
- nếu handler có đánh dấu bypass thì trả raw data

Format success hiện tại trong code là:

```json
{
  "success": true,
  "data": ...
}
```

### Ý nghĩa

- request chạy bình thường → đi qua interceptor
- request bị lỗi → đi qua exception filter

Hai luồng này độc lập nhau.

## 10. Response lỗi

File: `src/common/filters/http-exception.filter.ts`

Nó bắt lỗi toàn cục và đổi về format:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Vui lòng kiểm tra lại thông tin nhập.",
    "traceId": "req-9876-abc-123",
    "details": {
      "username": "Tên đăng nhập đã tồn tại.",
      "password": "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt."
    }
  }
}
```

### Mục tiêu của filter

- thống nhất format lỗi cho frontend
- có `traceId` để trace request
- có `code` để frontend phân loại lỗi
- có `details` khi là validation error

## 11. `main.ts` nên giữ gì, và vì sao

Hiện tại `main.ts` nên giữ phần bootstrap và các config global cần thiết nhất.

### Nên giữ ở `main.ts`

- `ValidationPipe`
- global exception filter
- những config khởi động cốt lõi

### Không nên nhét hết vào `main.ts`

- logic format success
- logic xử lý lỗi chi tiết
- logic domain
- logic repository

Vì những thứ đó đã có file riêng.

## 12. Tại sao interceptor success vẫn là global

Bạn muốn interceptor cho các request không lỗi — điều đó vẫn hợp lý và nên giữ.

Về mặt thiết kế:

- interceptor success là lớp wrap response chung
- nó áp cho mọi endpoint trừ endpoint bị bypass
- nên nó vẫn là tầng global behavior

Nói cách khác:

- success path: global interceptor
- error path: global exception filter
- input validation: global pipe

## 13. Ví dụ luồng thực tế (Endpoint Đăng nhập - Login)

Để dễ hình dung vòng đời của một request, hãy xem ví dụ về request POST `/auth/login`.

### Kịch bản 1: Đăng nhập thành công

1. **Client**: Gửi request POST `/auth/login` với dữ liệu `username` và `password`.
2. **TraceId Middleware**: Ngay khi request vào ứng dụng, một mã `traceId` (ví dụ: `req-9876xyz`) được sinh ra và gắn vào object `request`.
3. **ValidationPipe (Global)**:
   - Nhận cục dữ liệu JSON và đối chiếu với class `LoginDto`.
   - Vì dữ liệu hợp lệ, nó cho phép request đi tiếp.
4. **AuthController**:
   - `login(@Body() loginDto: LoginDto)` nhận được data sạch.
   - Controller lập tức gọi `this.authService.login(loginDto)`.
5. **AuthService**:
   - Tìm user thông qua repository (`userRepository.findByUsername`).
   - Kiểm tra password.
   - Tạo access token.
   - Trả về object `{ user, token }` cho Controller.
6. **AuthController**: Trả thẳng kết quả `{ user, token }` (return luôn, không tự JSON wrap).
7. **ResponseTransformInterceptor (Global)**:
   - Bắt lấy object `{ user, token }`.
   - Wrap nó vào format thành công.
8. **Client**: Nhận được kết quả HTTP 200 OK:
   ```json
   {
     "success": true,
     "data": {
       "user": { "id": 1, "username": "admin" },
       "token": "ey..."
     }
   }
   ```

### Kịch bản 2: Đăng nhập thất bại (Sai Validation)

1. **Client**: Gửi request thiếu password.
2. **TraceId Middleware**: Gắn `traceId: req-1234abc`.
3. **ValidationPipe**:
   - Kiểm tra với `LoginDto` và thấy thiếu password (không lọt `IsNotEmpty`).
   - Tự động ném ra `BadRequestException({ "message": ["password should not be empty"] })`.
   - Request KHÔNG lọt được vào Controller.
4. **HttpExceptionFilter (Global)**:
   - Bắt Exception vừa ném ra.
   - Lấy status code = 400.
   - Vì là 400 lỗi input, filter ánh xạ nó vào format lỗi quy định cho VALIDATION_FAILED.
5. **Client**: Nhận được kết quả HTTP 400 Bad Request:
   ```json
   {
     "error": {
       "code": "VALIDATION_FAILED",
       "message": "Vui lòng kiểm tra lại thông tin nhập.",
       "traceId": "req-1234abc",
       "details": ["password should not be empty"]
     }
   }
   ```

### Kịch bản 3: Đăng nhập thất bại (Sai mật khẩu)

1. **Client**: Gửi request POST đầy đủ data, hợp lệ, nhưng mk sai.
2. **TraceId Middleware**: Gắn `traceId: req-5678def`.
3. **ValidationPipe**: Data hợp lệ, cho phép đi qua.
4. **AuthController**: Gọi sang `AuthService`.
5. **AuthService**:
   - Tìm thấy user, nhưng hash không đúng.
   - Ném ngoại lệ `throw new UnauthorizedException()`.
6. **HttpExceptionFilter**:
   - Bắt lấy `UnauthorizedException`.
   - Lấy status code = 401.
   - Đổi message theo hằng số đã thống nhất thành `UNAUTHORIZED`.
7. **Client**: Nhận được kết quả HTTP 401 Unauthorized:
   ```json
   {
     "error": {
       "code": "UNAUTHORIZED",
       "message": "Bạn không có quyền truy cập.",
       "traceId": "req-5678def"
     }
   }
   ```

## 14. Kết luận ngắn

- `main.ts` hiện tại chỉ đóng vai trò bootstrap cốt lõi.
- `ValidationPipe` giữ ở cấp global để bảo vệ toàn hệ thống tại vòng gửi xe.
- Mọi response thành công đều tự động mang chuẩn chung đi qua `ResponseTransformInterceptor`.
- Mọi lỗi cố ý (từ throw exception của Dev) hay thụ động (ValidationPipe) đều được quy về một mối `HttpExceptionFilter` để nhất quán dữ liệu ở đầu ra và luôn có `traceId` giúp tra cứu.
