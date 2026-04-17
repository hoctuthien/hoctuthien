# Response Transform Interceptor Guide

Tài liệu này giải thích đầy đủ cách backend của dự án đang chuẩn hóa response bằng interceptor, vì sao cần làm như vậy, interceptor đang hoạt động thế nào, khi nào nên dùng global interceptor, và khi nào cần bỏ qua transform.

---

## 1. Mục tiêu của response transform

Trong một backend lớn, mỗi controller có thể trả dữ liệu theo một kiểu khác nhau:

- endpoint này trả `user` raw
- endpoint kia trả `{ data: [...] }`
- endpoint khác trả `{ success: true, message, data }`
- endpoint download file lại trả binary/stream

Nếu không chuẩn hóa, frontend sẽ phải xử lý nhiều format khác nhau, code dễ rối và khó maintain.

### Mục tiêu chính

- giữ response nhất quán
- giảm lặp code ở controller
- tạo format chuẩn cho frontend
- dễ thêm pagination, message, metadata sau này
- tách logic transform ra khỏi business logic

---

## 2. Interceptor là gì

Trong NestJS, interceptor là một lớp trung gian chạy:

- trước khi handler/controller được gọi
- sau khi handler/controller trả dữ liệu

Nó phù hợp cho các việc như:

- transform response
- logging
- caching
- timing/performance tracking
- mapping dữ liệu

Trong dự án này, interceptor được dùng để **transform response trả về**.

---

## 3. File interceptor hiện tại đang làm gì

File hiện tại là:

`src/common/interceptors/response-transform.interceptor.ts`

Nội dung chính của file này là:

- nhận response raw từ controller
- kiểm tra response đã có format chuẩn chưa
- nếu chưa có thì bọc lại thành:

```ts
{
  success: true,
  data: ...
}
```

- nếu đã đúng format rồi thì giữ nguyên

---

## 4. Giải thích luồng hoạt động

### Response raw từ controller

Ví dụ controller trả:

```ts
return course;
```

thì response gốc là dữ liệu thô.

### Interceptor can thiệp

Interceptor sẽ bắt response này và transform thành:

```ts
{
  success: true,
  data: course
}
```

### Response ra client

Frontend luôn nhận một format dễ đoán, dễ parse.

---

## 5. Giải thích từng phần trong interceptor

### Import

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
```

#### `CallHandler`

Đại diện cho luồng xử lý tiếp theo sau interceptor.

#### `ExecutionContext`

Chứa context của request hiện tại. Trong file này biến này chưa dùng trực tiếp, nhưng vẫn là tham số chuẩn của interceptor.

#### `Injectable`

Đánh dấu class này có thể được NestJS quản lý qua dependency injection.

#### `NestInterceptor`

Interface của NestJS dành cho interceptor.

#### `map`

Operator của RxJS dùng để transform dữ liệu trả về.

#### `Observable`

NestJS xử lý response theo stream async, nên interceptor trả về `Observable`.

---

### `@Injectable()`

```ts
@Injectable()
```

Dòng này cho NestJS biết class này là một provider có thể inject và quản lý.

---

### Comment mô tả chức năng

```ts
// This interceptor normalizes server responses.
// It keeps JSON API responses consistent across the backend.
// If a controller already returns { success, data }, it will keep that shape.
// Otherwise, it wraps the raw payload into { success: true, data }.
```

Phần comment này giúp người đọc hiểu nhanh mục đích của interceptor.

---

### Khai báo class interceptor

```ts
export class ResponseTransformInterceptor implements NestInterceptor {
```

Class này là interceptor custom của dự án.

---

### Method `intercept`

```ts
intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
```

Đây là method bắt buộc khi implement `NestInterceptor`.

- `_context`: request context
- `next`: handler tiếp theo trong pipeline
- `Observable<any>`: response async sau transform

Dấu `_` trước `context` cho thấy biến này hiện chưa được dùng.

---

### `next.handle().pipe(...)`

```ts
return next.handle().pipe(
```

- `next.handle()` gọi controller/service phía sau interceptor
- `.pipe(...)` cho phép chèn các thao tác transform lên response

---

### `map((data) => ...)`

```ts
map((data) => {
```

- `data` là response gốc từ controller
- `map` sẽ transform response này trước khi trả ra client

---

### Kiểm tra response đã chuẩn chưa

```ts
if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
  return data;
}
```

Điều kiện này nhằm kiểm tra:

- response có tồn tại không
- response có phải object không
- object có field `success`
- object có field `data`

Nếu đúng, interceptor hiểu rằng controller đã trả response đúng format rồi, nên giữ nguyên.

#### Ví dụ response được giữ nguyên

```ts
return {
  success: true,
  data: course,
};
```

---

### Wrap raw data nếu cần

```ts
return {
  success: true,
  data,
};
```

Nếu controller trả dữ liệu thô như:

```ts
return course;
```

thì interceptor sẽ tự bọc lại thành:

```ts
{
  success: true,
  data: course
}
```

Mục tiêu là để tất cả API JSON bình thường đều có format đồng nhất.

---

## 6. Tại sao cần global interceptor

Interceptor này đang được gắn global trong `main.ts`, nghĩa là nó áp dụng cho hầu hết response của app.

### Lợi ích

- không phải lặp logic bọc response ở từng controller
- frontend nhận format đồng nhất
- dễ mở rộng thêm pagination, message, metadata
- dễ kiểm soát response standard của toàn backend

---

## 7. Khi nào không nên transform

Không phải endpoint nào cũng nên bị wrap thành `{ success, data }`.

### Các case nên bỏ qua

- download file
- stream / video / audio
- webhook callback
- redirect
- raw response với `@Res()`
- SSE / event stream
- binary data

### Vì sao

Những response này thường có format riêng. Nếu bọc lại sẽ gây lỗi hoặc làm hỏng output.

---

## 8. Cách bỏ qua transform cho endpoint đặc biệt

Tài liệu thiết kế dự kiến nên có annotation riêng, ví dụ:

```ts
@SkipResponseTransform()
```

### Ý nghĩa

Annotation này sẽ báo cho interceptor rằng:

- endpoint này không cần transform
- trả raw response nguyên bản

### Ví dụ sử dụng

```ts
@SkipResponseTransform()
@Get('download')
downloadFile() {
  return this.service.download();
}
```

---

## 9. Response format chuẩn mà interceptor hướng tới

### Success response

```ts
{
  success: true,
  data: ...
}
```

### Response đã có message

```ts
{
  success: true,
  message: 'Created successfully',
  data: ...
}
```

### Paginated response

```ts
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

### Error response

Error nên được xử lý qua exception filter, không phải interceptor.

---

## 10. Vai trò của `main.ts`

Interceptor được gắn global trong `main.ts` để mọi request đi qua cùng một lớp xử lý response.

Ý nghĩa của việc gắn ở `main.ts`:

- áp dụng cho toàn app
- tránh phải add interceptor từng controller
- đảm bảo consistency

Nếu sau này cần bỏ qua transform cho vài route, nên dùng decorator riêng thay vì gỡ global interceptor.

---

## 11. Interceptor không thay thế DTO hay Pipe

Nhiều người hay nhầm:

- interceptor dùng cho response
- pipe dùng cho request

### Khi client gửi data vào server

Dùng:

- DTO
- `ValidationPipe`
- `class-transformer`
- custom pipe nếu cần

### Khi server trả data ra client

Dùng:

- interceptor
- serializer / mapper
- response DTO

---

## 12. Mô hình xử lý request/response nên nhớ

### Request vào server

1. client gửi request
2. guard kiểm tra quyền
3. pipe validate/transform input
4. controller nhận dữ liệu
5. service xử lý business logic

### Response ra client

1. service trả data
2. interceptor transform response
3. client nhận output cuối cùng

---

## 13. Khi nào nên dùng interceptor này

Rất phù hợp cho:

- `GET /users`
- `GET /courses`
- `POST /login`
- `GET /bookings`
- mọi endpoint JSON thông thường

Không phù hợp cho:

- file download
- webhook
- stream
- response dùng `@Res()` trực tiếp

---

## 14. Quy ước nên dùng trong dự án

### Nên làm

- trả raw data từ service/controller cho đơn giản
- interceptor global bọc response chuẩn
- dùng một format chung cho frontend
- thêm decorator skip cho endpoint đặc biệt

### Không nên làm

- mỗi controller một kiểu response khác nhau
- bọc response thủ công ở mọi nơi
- dùng interceptor cho file/stream/webhook

---

## 15. Kết luận

`ResponseTransformInterceptor` là lớp chuẩn hóa response của backend.

Nó giúp:

- response thống nhất
- frontend dễ xử lý
- code controller sạch hơn
- hệ thống dễ mở rộng hơn

Tuy nhiên, interceptor này chỉ nên áp dụng cho các endpoint JSON thông thường. Với endpoint đặc biệt, nên có cơ chế skip transform.

---

## 16. Gợi ý bước tiếp theo

Nếu muốn hoàn thiện hệ thống hơn, nên làm tiếp:

1. tạo `@SkipResponseTransform()` decorator
2. update interceptor để đọc metadata và bỏ qua endpoint đặc biệt
3. tạo `PaginationMetaDto` và `PaginatedResponseDto`
4. thêm global exception filter để chuẩn hóa lỗi
