# Quy ước đặt tên nhánh (Branch Naming Convention)

Cấu trúc: `<type>/<tên-dev>/<scope>/<mô-tả-ngắn>`

## 1. Types
| Type | Mô tả |
| :--- | :--- |
| `feat` | Tính năng mới (new feature) |
| `fix` | Sửa lỗi (bug fix) |
| `refactor` | Tái cấu trúc/cải thiện mã nguồn (code improvement) |
| `chore` | Các công việc linh tinh (config, deps, tooling) |
| `docs` | Viết/cập nhật tài liệu |
| `test` | Viết/cập nhật unit test/integration test |
| `style` | Thay đổi format, CSS (không ảnh hưởng logic) |
| `perf` | Tối ưu hóa hiệu năng |
| `hotfix` | Sửa lỗi khẩn cấp trên môi trường Production |

## 2. Scopes
| Scope | Mô tả |
| :--- | :--- |
| `booking` | Các tính năng liên quan đến đặt lịch |
| `charity` | Các tính năng liên quan đến từ thiện |
| `mentor` | Các tính năng liên quan đến mentor |
| `auth` | Đăng nhập, token, phân quyền (RBAC) |
| `payment` | Thanh toán, hoàn tiền |
| `email` | Gửi email thông báo |
| `core` | Base component, axios config, frontend core logic |
| `shared` | Component dùng chung, utils |
| `packages` | shared-types, shared-validators |
| `config` | Docker, commitlint, husky configuration |
| `deps` | Cập nhật dependencies (package.json) |
| `db` | Database migration, entity, seeding |

## 3. Ví dụ
- `feat/nghiadptwork/fe/base-components`
- `fix/trhgam/auth/token-expired`
- `hotfix/ckjn0411/be/payment-callback`
- `chore/thangwibu1/config/docker-compose`
