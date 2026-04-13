Tài liệu hướng dẫn sử dụng Pipe (Validation & Transformation)

### 1. Tổng quan

Trong dự án này, Pipe được sử dụng để đảm bảo dữ liệu đầu vào (từ URL hoặc Query) luôn đúng định dạng trước khi đi vào logic xử lý của Controller.
Chúng ta sử dụng một Core Pipe chung kết hợp với Kế thừa Class để tối ưu việc tái sử dụng code theo tư duy OOP chuyên nghiệp.

Luồng hoạt động:
Regex (constant) ➔ Core Pipe (logic) ➔ Specific Pipe (class) ➔ Controller

### 2. Cấu trúc bộ công cụ

- Constants (validation.constant.ts): Nơi định nghĩa tập trung các regex và message lỗi.

- Core Pipe (dynamic-regex.pipe.ts): Lớp xử lý logic transform và validate chuỗi tổng quát.

- Class Pipes (id-validation.pipe.ts): Các lớp đã được đóng gói sẵn quy tắc cho từng đối tượng cụ thể.

### 3. Cách sử dụng trong Controller

Khai báo trực tiếp Class Pipe vào @Param hoặc @Query giống như các Built-in Pipe của NestJS.

```TypeScript
// src/common/pipes/id-validation.pipe.ts
import { DynamicRegexPipe } from './dynamic-regex.pipe';
import { VALIDATION_RULES } from '../constants/validation.constant';

export class ParseMenteeIdPipe extends DynamicRegexPipe {
  constructor() {
    super(VALIDATION_RULES.MENTEE_ID.regex, VALIDATION_RULES.MENTEE_ID.message);
  }
}

// Tại Controller
@Get('mentee/:id')
findOne(@Param('id', ParseMenteeIdPipe) id: string) {
  return { id };
}
```

### 4. Quy trình thêm một quy tắc mới

Khi dự án có thêm đối tượng mới cần xác thực (ví dụ: SPONSOR_ID), hãy thực hiện 3 bước:

Cập nhật validation.constant.ts: Thêm quy tắc mới vào object VALIDATION_RULES.

```TypeScript
SPONSOR_ID: {
  regex: /^SP-\d{5}$/,
  message: 'Mã nhà tài trợ phải có định dạng SP-xxxxx',
}
```

Khai báo Class trong id-validation.pipe.ts: Tạo class mới kế thừa từ DynamicRegexPipe và gọi super().

Sử dụng tại Controller: Gọi trực tiếp Class vừa tạo mà không cần khởi tạo new.

### 5. Lưu ý kỹ thuật

Ưu tiên: Sử dụng kiểu Class giúp mã nguồn tuân thủ nguyên tắc SOLID, sạch sẽ và dễ dàng bảo trì hơn so với Factory Function.

Tự động hóa: NestJS tự động quản lý instance của các Pipe này, giúp tối ưu hiệu suất và bộ nhớ.

Lỗi trả về: Nếu dữ liệu không khớp regex, hệ thống tự động trả về lỗi 400 Bad Request kèm theo message đã cấu hình.
