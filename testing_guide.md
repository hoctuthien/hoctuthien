# Hướng Dẫn Thử Nghiệm Quy Trình Tạo & Đăng Ký Khóa Học

Tài liệu này hướng dẫn chi tiết cách kiểm tra toàn bộ luồng tạo khóa học (Mentor) và đăng ký học (Mentee), bao gồm cả cách thao tác trực quan trên giao diện (UI) và truy vấn trực tiếp cơ sở dữ liệu (Database).

---

## 🛠 Chuẩn Bị & Điều Kiện Tiền Đề

Để quá trình kiểm thử diễn ra trơn tru, bạn cần có ít nhất:
1. **Tài khoản Mentor**: Đã được phê duyệt hồ sơ chuyên môn (Approved Mentor Profile).
2. **Tài khoản Mentee**: Đã kích hoạt tài khoản thành công (Verified Mentee).

> [!NOTE]
> Do hệ thống quản trị (Admin) kiểm soát quyền lực của cả hai vai trò, bạn có thể thay đổi trạng thái tài khoản trực tiếp trong cơ sở dữ liệu PostgreSQL để đẩy nhanh quá trình thử nghiệm.

### Câu lệnh SQL cập nhật nhanh trạng thái trong Database:
* **Kích hoạt tài khoản Mentee (isVerified = true):**
  ```sql
  UPDATE users SET is_verified = true, status = 'active' WHERE email = 'email_mentee_cua_ban@gmail.com';
  ```
* **Phê duyệt hồ sơ Mentor (isApproved = true):**
  ```sql
  -- 1. Tìm userId của Mentor từ bảng users
  SELECT id FROM users WHERE email = 'email_mentor_cua_ban@gmail.com';
  
  -- 2. Cập nhật hồ sơ Mentor của userId vừa tìm được trong bảng mentor_profiles
  UPDATE mentor_profiles SET is_approved = true, status = 'approved' WHERE user_id = 'uuid_cua_mentor';
  ```

---

## 📋 1. Kiểm Thử Quy Trình Tạo Khóa Học (Mentor)

### 🔹 Thao tác trên Giao diện (Frontend)
1. Đăng nhập vào hệ thống bằng tài khoản **Mentor** đã được duyệt hồ sơ.
2. Truy cập vào trang **Quản lý khóa học** qua Sidebar hoặc đường dẫn trực tiếp: `/mentor/courses`.
3. Bấm nút **"Tạo khóa học mới"** (dẫn tới trang `/courses/create`).
4. Điền các trường thông tin:
   * **Tên khóa học**: Ví dụ `Lập trình NestJS nâng cao`.
   * **Mô tả ngắn**: Nội dung tóm tắt giá trị khóa học.
   * **Chủ đề**: Chọn danh mục (ví dụ `Lập trình di động`).
   * **Cấp độ**: Chọn cấp độ đào tạo mong muốn.
   * **Tổng thời lượng**: Điền số giờ học mong muốn (ví dụ `12`).
   * **Hình thức giảng dạy**: `Học trực tuyến (Online)`.
   * **Biểu phí**: Lựa chọn `Miễn phí` hoặc `Trả phí`. Nếu trả phí, điền số tiền học phí.
   * **Ảnh bìa**: Lựa chọn một trong các preset ảnh gợi ý hoặc dán liên kết URL ảnh tùy chỉnh.
   * **Giáo trình**: Bạn có thể thêm các chương học và bài giảng tương ứng trực tiếp trên giao diện kéo thả trực quan.
5. Bấm **"Hoàn thành và Đăng ký"**.
6. Hệ thống sẽ hiển thị màn hình **Khởi tạo khóa học thành công!** kèm theo tóm tắt số chương học và bài giảng. Bạn có thể kiểm tra danh sách khóa học vừa tạo tại trang `/mentor/courses`.

### 🔹 Xác minh dưới Cơ sở dữ liệu (Database)
Truy vấn bảng `courses` để đảm bảo dữ liệu được lưu đầy đủ và không bị lọc mất các thuộc tính mô tả hay ảnh bìa:
```sql
SELECT id, title, description, thumbnail_url, price, duration_minutes, status, metadata, prerequisites
FROM courses
ORDER BY created_at DESC
LIMIT 1;
```
👉 *Đảm bảo rằng các cột `description`, `thumbnail_url` và `metadata` được ghi nhận chính xác theo form vừa điền (không bị null hay rỗng).*

---

## 📋 2. Kiểm Thử Quy Trình Đăng Ký Khóa Học (Mentee)

### 🔹 Thao tác trên Giao diện (Frontend)
1. Đăng nhập vào hệ thống bằng tài khoản **Mentee** đã kích hoạt.
2. Truy cập trang chủ danh sách khóa học `/courses` và bấm **"Xem chi tiết"** khóa học vừa được Mentor khởi tạo ở trên.
3. Ở Sidebar bên phải, bạn sẽ thấy thông tin chi phí và nút **"Đăng ký học ngay"**. Bấm vào nút này.
4. Một modal đặt lịch học tập chuyên nghiệp sẽ hiện lên:
   * **Chọn Ngày Học**: Chọn một ngày bất kỳ (bắt đầu từ ngày mai trở đi).
   * **Chọn Khung Giờ Bắt Đầu**: Lựa chọn khung giờ rảnh mong muốn.
   * **Ghi chú**: Điền ghi chú gửi tới Mentor.
5. Bấm **"Xác nhận đặt lịch"**.
6. Hệ thống sẽ xử lý và sinh ra **Mã QR thanh toán chuyển khoản** thông qua cổng VietQR (đối với khóa học trả phí hoặc có phí dịch vụ kích hoạt).
7. Thực hiện thanh toán hoặc giả lập kiểm tra giao dịch thành công. Trạng thái lịch học sẽ được cập nhật thành công trên Dashboard của Mentee tại `/dashboard`.

### 🔹 Kiểm thử các Ràng buộc & Logic Xác thực (Validation Rules)

Hệ thống đã được thiết kế chặt chẽ để đảm bảo không bị xung đột lịch và quyền hạn. Hãy thử nghiệm các trường hợp kiểm thử biên dưới đây để xác thực tính đúng đắn của logic:

#### Case 2.1: Kiểm tra ràng buộc khung giờ rảnh của Mentor (Time slots)
* **Mô tả**: Mentor cấu hình lịch rảnh cụ thể trong hồ sơ (ví dụ: chỉ rảnh thứ Hai từ 09:00 - 11:00).
* **Thử nghiệm**: Mentee cố tình đặt lịch vào một ngày khác (ví dụ: thứ Ba) hoặc khung giờ khác (ví dụ: 15:00).
* **Kết quả mong muốn**: Backend ném ra lỗi `400 Bad Request` kèm thông báo chi tiết: *"Thời gian 15:00 không nằm trong khung giờ rảnh của Mentor vào Tuesday..."*

#### Case 2.2: Trùng lịch học của Mentee (Mentee Conflict)
* **Mô tả**: Mentee đã có một lịch học khác hoạt động vào cùng khung giờ đó.
* **Thử nghiệm**: Đăng ký tiếp một khóa học khác và chọn đúng ngày giờ trùng với lịch đã đăng ký thành công trước đó.
* **Kết quả mong muốn**: Hệ thống từ chối và báo lỗi: *"Lịch học bị trùng với một buổi học khác của bạn..."*

#### Case 2.3: Trùng lịch giảng dạy của Mentor (Mentor Conflict)
* **Mô tả**: Mentor đã có lịch dạy một học sinh khác vào giờ đó.
* **Thử nghiệm**: Dùng một tài khoản Mentee khác đăng ký đúng khóa học đó hoặc khóa học khác của cùng Mentor vào khung giờ đã bị booked trước đó.
* **Kết quả mong muốn**: Hệ thống chặn và báo lỗi: *"Lịch học bị trùng với lịch giảng dạy khác của Cố vấn (Mentor) vào khung giờ này."*

#### Case 2.4: Đăng ký trùng lặp trên cùng một khóa học
* **Mô tả**: Mỗi khóa học (1-on-1) chỉ cho phép tối đa 1 Mentee đăng ký và hoạt động đồng thời.
* **Thử nghiệm**: Một học viên khác cố tình đăng ký vào khóa học đã có học viên đăng ký hoạt động.
* **Kết quả mong muốn**: Hệ thống trả về lỗi: *"Khóa học này đã có học viên đăng ký và đang hoạt động."*

---

## 🔗 Các File Liên Quan Trong Codebase

* **Backend:**
  * Định nghĩa thực thể khóa học: [course.entity.ts](file:///d:/code/http/hoctuthien/backend/src/modules/course/entities/course.entity.ts)
  * Logic Zod Schema cho khóa học: [course.schema.ts](file:///d:/code/http/hoctuthien/backend/src/modules/course/schema/course.schema.ts)
  * Dịch vụ xử lý đăng ký học: [course-booking.service.ts](file:///d:/code/http/hoctuthien/backend/src/modules/course-booking/services/course-booking.service.ts)
* **Frontend:**
  * API kết nối nghiệp vụ khóa học: [courseGateway.ts](file:///d:/code/http/hoctuthien/frontend/src/core/gateway/courseGateway.ts)
  * Component giao diện tạo khóa học: [course-create-client.tsx](file:///d:/code/http/hoctuthien/frontend/src/app/%28public%29/courses/create/course-create-client.tsx)
  * Component chi tiết và đặt lịch học: [page.tsx (Chi tiết khóa học)](file:///d:/code/http/hoctuthien/frontend/src/app/%28public%29/courses/detail/%5Bid%5D/page.tsx)
