# Quy ước ghi Commit (Commit Message Convention)

Dựa trên chuẩn **Conventional Commits** và được cấu hình qua `commitlint`.

Cấu trúc: `<type>(<scope>): <mô tả ngắn>`

## 1. Thành phần
- **Type**: Loại thay đổi (Bắt buộc).
- **Scope**: Vùng ảnh hưởng của thay đổi (Bắt buộc theo cấu hình hiện tại).
- **Subject**: Mô tả ngắn gọn những gì đã thực hiện.

## 2. Các loại Type
| Type | Ý nghĩa |
| :--- | :--- |
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi bug |
| `chore` | Cập nhật cấu hình, dependency, tooling |
| `docs` | Thay đổi về tài liệu (README, docs folder) |
| `style` | Định dạng code, CSS (không đổi logic) |
| `refactor` | Tái cấu trúc code |
| `perf` | Tối ưu hiệu năng |
| `test` | Thêm hoặc sửa unit test |
| `revert` | Hoàn tác một commit trước đó |

## 3. Các loại Scope
Dựa trên cấu hình trong `commitlint.config.js`:
- **Frontend**: `booking`, `charity`, `core`, `shared`, `auth`
- **Backend**: `api`, `db`, `queue`, `email`
- **Chung**: `deps`, `ci`, `docker`, `config`

## 4. Ví dụ đúng chuẩn
- `feat(booking): thêm giao diện chọn ngày đặt lịch`
- `fix(auth): sửa lỗi không lưu refresh token vào cookie`
- `chore(config): cập nhật luật trong commitlint.config.js`
- `docs(readme): bổ sung hướng dẫn chạy docker-compose`

## 5. Quy tắc quan trọng
- Tiêu đề commit (header) không dài quá **72 ký tự**.
- Không viết hoa chữ cái đầu của mô tả (subject).
- Không kết thúc tiêu đề bằng dấu chấm.
- Luôn kiểm tra lại trước khi push.
