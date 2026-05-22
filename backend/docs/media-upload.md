# Tài liệu Hướng dẫn Upload Media (Openinary)

Tài liệu này mô tả cách thức tích hợp và sử dụng module Media để upload hình ảnh lên server Openinary tự host trên VPS.

## 1. Cấu hình hệ thống

Đảm bảo file `.env` của bạn có đầy đủ các biến sau:

```env
# URL server Openinary (không có dấu / ở cuối)
OPENINARY_URL=http://your-vps-ip:3000
# API Key lấy từ dashboard Openinary (/setup -> Profile -> API Keys)
OPENINARY_API_KEY=op_live_xxxxxxxxxxxxxx
```

## 2. Luồng hoạt động (Workflow)

1. **Client** gửi request `POST` đến `/api/v1/media/upload`.
2. Request phải ở định dạng `multipart/form-data` với key là `file`.
3. **NestJS** nhận file, kiểm tra tính hợp lệ (Size < 5MB, định dạng ảnh).
4. **MediaService** chuyển tiếp file sang Openinary kèm theo Header `Authorization: Bearer <API_KEY>`.
5. **Openinary** lưu trữ, tối ưu hóa và trả về thông tin (URL, Metadata).
6. **NestJS** trả kết quả cuối cùng cho Client.

## 3. Cách sử dụng API

### Endpoint: `POST /media/upload`

- **Authentication**: Yêu cầu Bearer Token (JWT).
- **Content-Type**: `multipart/form-data`
- **Body**:
    - `file`: (Binary) File hình ảnh cần upload.

### Ví dụ bằng cURL:

```bash
curl -X POST http://localhost:5050/api/v1/media/upload \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@/path/to/your/image.png"
```

### Kết quả trả về (JSON):

```json
{
  "success": true,
  "files": [
    {
      "filename": "screenshot.png",
      "path": "screenshot.png",
      "size": 55733,
      "url": "https://cloud.hoctuthien.com/t/screenshot.png"
    }
  ]
}
```

## 4. Cách Test

### Cách 1: Sử dụng Swagger UI
1. Truy cập: `http://localhost:5050/api/v1/docs`.
2. Tìm đến tag **media**.
3. Bấm **Authorize** và nhập JWT Token lấy từ Cookie (hoặc login).
4. Chọn endpoint `/api/v1/media/upload`, bấm **Try it out**.
5. Chọn file từ máy tính và bấm **Execute**.

### Cách 2: Sử dụng Postman
1. Tạo request mới: `POST` URL `http://localhost:5050/api/v1/media/upload`.
2. Tab **Authorization**: Chọn `Bearer Token` và dán JWT.
3. Tab **Body**: Chọn `form-data`.
    - Key: `file` (chuyển type từ Text sang File).
    - Value: Chọn file ảnh từ máy của bạn.
4. Bấm **Send**.

## 5. Tích hợp vào các Module khác

Để sử dụng logic upload trong code (ví dụ khi tạo Course), bạn có thể Inject `MediaService`:

```typescript
constructor(private readonly mediaService: MediaService) {}

async createCourse(file: Express.Multer.File, data: any) {
  const uploadResult = await this.mediaService.uploadImage(file);
  const imageUrl = uploadResult.data[0].url;
  // Lưu imageUrl vào DB...
}
```
