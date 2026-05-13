# Tài liệu: Next.js BFF & API Architecture

Tài liệu này mô tả kiến trúc 5 lớp (Layered Architecture) và luồng xử lý Authentication sử dụng mô hình BFF (Backend for Frontend) trong dự án Next.js kết hợp NestJS.

## 1. Tổng quan kiến trúc (Architecture Overview)

Dự án sử dụng mô hình BFF để đảm bảo bảo mật tối đa cho Token và tách biệt logic giữa giao diện (UI) và API của Backend lõi. Next.js đóng vai trò vừa là **Frontend (UI)** vừa là **BFF (API Routes)**.

**Sơ đồ luồng dữ liệu:**
`UI (Next.js Client)` ➔ `Gateway` ➔ `httpClient` ➔ `BFF (Route Handler)` ➔ `apiService` ➔ `Backend (NestJS)`

---

## 2. Các lớp trong hệ thống (Layered Structure)

### Lớp 1: UI Layer (Client Components)
- **Vị trí:** `src/app/...`
- **Nhiệm vụ:** Hiển thị giao diện, nhận input từ người dùng.
- **Quy tắc:** Chỉ gọi các hàm từ **Gateway**. Không gọi trực tiếp `fetch` trong Component.

### Lớp 2: Gateway Layer (Domain Logic)
- **Vị trí:** `src/core/gateway/...`
- **Nhiệm vụ:** Định nghĩa các hàm nghiệp vụ (ví dụ: `login`, `getProfile`). Thực hiện biến đổi dữ liệu (Data Transformation) và xử lý bóc tách mảng `data` từ Backend.
- **Quy tắc:** Sử dụng `httpClient` để gửi yêu cầu lên BFF.

### Lớp 3: HTTP Client Layer (Infrastructure)
- **Vị trí:** `src/core/api/...`
- **Thành phần:**
  - `base.ts`: Chứa `createHttpClient` (Factory) để tạo các instance gọi API. Trả về cả `data` và `headers`.
  - `apiService`: Instance chạy trên Server (BFF ➔ NestJS). Dùng `BACKEND_URL` nội bộ.
  - `httpClient`: Instance chạy trên Browser (UI ➔ BFF). Dùng prefix `/api`.

### Lớp 4: BFF Layer (Next.js API Routes)
- **Vị trí:** `src/app/api/...`
- **Nhiệm vụ:**
  - Quản lý **HttpOnly Cookie** (Lưu trữ Token an toàn).
  - Proxy request từ Frontend sang Backend lõi.
  - Bóc tách Token từ Header `Set-Cookie` của Backend (do Interceptor ở Backend xóa body).

---

## 3. Luồng Authentication (Auth Flow)

### A. Đăng nhập (Login)
1. Browser: UI gọi `authGateway.login(credentials)`.
2. Browser: `httpClient` gửi request tới `/api/auth/login`.
3. BFF: Nhận request, gọi NestJS qua `apiService.post('/auths/login')`.
4. Backend: NestJS xác thực, trả về Token trong Header `Set-Cookie`.
5. BFF: 
   - Lục tìm Token trong Header trả về của Backend.
   - Thiết lập Cookie cho Browser (HttpOnly, Secure, SameSite=Lax).
   - Trả về thông tin User (JSON) cho Browser.
6. Browser: Cập nhật `userStore` (Zustand) và chuyển hướng tới `/profile`.

### B. Lấy thông tin (Get Profile)
1. Browser: `AuthProvider` hoặc UI gọi `authGateway.getMe()`.
2. BFF: `GET /api/auth/me` nhận request, lấy `access_token` từ Cookie.
3. BFF: Gọi NestJS với Header `Authorization: Bearer <token>`.
4. Backend: Trả về dữ liệu dạng `{ data: [ { user } ] }`.
5. BFF: Giải nén `data[0].user` và trả về cho Browser.

---

## 4. Hướng dẫn dành cho Developer

### Quy trình thêm tính năng mới:
1. **Define Type**: Kiểm tra `api.generated.ts` để lấy chuẩn DTO từ Backend.
2. **Create Gateway**: Tạo hàm gọi API trong thư mục `gateway`. Lưu ý xử lý bóc tách mảng `data[0]` nếu Backend dùng Interceptor bọc dữ liệu.
3. **BFF Route (Nếu cần)**: Nếu tính năng cần bảo mật hoặc proxy, tạo API Route trong `app/api`.
4. **UI Integration**: Sử dụng React Query để gọi Gateway và hiển thị dữ liệu.

### Quy tắc bảo mật:
- Tuyệt đối không lưu Token vào `localStorage`.
- Mọi API cần bảo mật phải được proxy qua BFF để đính kèm Cookie tự động.
- Sử dụng `HttpOnly` Cookie để chống tấn công XSS.
