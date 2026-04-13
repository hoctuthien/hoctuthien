# Tài liệu hướng dẫn sử dụng Pipe (Validation & Transformation)

### 1. Tổng quan
Trong dự án này, Pipe được sử dụng để đảm bảo dữ liệu đầu vào (từ URL hoặc Query) luôn đúng định dạng trước khi đi vào logic xử lý của Controller.
Chúng ta sử dụng một Dynamic Pipe kết hợp với Factory Function để tối ưu việc tái sử dụng code.

### 2. Cấu trúc bộ công cụ
`Constants (validation.constant.ts)`: Nơi định nghĩa các luật (Regex) và thông báo lỗi.

`Core Pipe (dynamic-regex.pipe.ts)`: Lớp xử lý logic kiểm tra chuỗi.

`Utility (pipe.util.ts)`: Hàm hỗ trợ gọi nhanh trong Controller.

### 3. Cách sử dụng trong Controller
Để validate một tham số, bạn chỉ cần sử dụng hàm `ParseCustomId('KEY')`.

A. Xác thực Route Parameter (@Param)
Sử dụng khi mã định danh nằm trực tiếp trên đường dẫn URL.

```ts
@Get('mentee/:id')
findOne(@Param('id', ParseCustomId('MENTEE_ID')) id: string) {
  // Nếu ID không khớp /^ME\d{8}$/, request sẽ dừng tại đây và trả về lỗi 400.
  return this.menteeService.findOne(id);
}
```

B. Xác thực Query Parameter (@Query)
Sử dụng khi mã định danh nằm sau dấu chấm hỏi trên URL (ví dụ: ?code=MT-S-1234).
```ts
@Get('search')
search(@Query('code', ParseCustomId('MENTOR_ID')) code: string) {
  return this.mentorService.findByCode(code);
}
```

### 4. Quy trình thêm một quy tắc mới
Khi dự án có thêm đối tượng mới cần validate (ví dụ: SPONSOR_ID), hãy làm theo 2 bước:

1.Mở file validation.constant.ts: Thêm định nghĩa mới vào object VALIDATION_RULES.

```ts
SPONSOR_ID: {
  regex: /^SP-\d{5}$/,
  message: 'Mã nhà tài trợ phải có định dạng SP-xxxxx',
}
```
2.Sử dụng tại Controller: Gọi ParseCustomId('SPONSOR_ID'). Không cần sửa lại bất kỳ file logic nào khác.

### 5. Lưu ý kỹ thuật
Ưu tiên: Luôn sử dụng ParseCustomId thay vì viết Regex trực tiếp trong Controller để đảm bảo tính đồng nhất (Dry Principle).

Lỗi trả về: Nếu Validation thất bại, hệ thống tự động trả về mã lỗi 400 Bad Request kèm theo message đã cấu hình.