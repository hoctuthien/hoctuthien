# 🤝 HocTuThien Frontend - MentorConnect Design System

Chào mừng bạn đến với kho mã nguồn Frontend của dự án **Học Từ Thiện (HocTuThien)**. Đây là phần giao diện được xây dựng dựa trên hệ thống thiết kế **MentorConnect**, tập trung vào trải nghiệm người dùng hiện đại, tinh tế và chuyên nghiệp.

---

## 🚀 Công nghệ sử dụng

Hệ thống được xây dựng trên nền tảng công nghệ mới nhất để đảm bảo hiệu suất và khả năng mở rộng:

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS (Design Tokens)
- **Component Lab**: [Storybook](https://storybook.js.org/) - Dùng để phát triển và kiểm thử component độc lập.
- **Icons**: [Lucide React](https://lucide.dev/) (thông qua `react-icons/lu`)
- **Language**: TypeScript

---

## 🧩 Hệ thống Component (MentorConnect UI)

Chúng tôi ưu tiên xây dựng các component có tính tái sử dụng cao, tuân thủ chặt chẽ Design Guideline:

- **Navigation**: Sidebar đa cấp, Breadcrumbs, Steps (Horizontal & Vertical).
- **Actions**: Button, Dropdown (nhiều biến thể), Pagination.
- **Forms**: Input, Checkbox, Selection components.
- **Feedback**: Alerts, Badges, Progress bars.

Tất cả các component đều có thể xem và tương tác trực tiếp thông qua Storybook.

---

## 🛠 Hướng dẫn phát triển

### 1. Cài đặt
```bash
npm install
```

### 2. Chạy môi trường Development
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

### 3. Chạy Storybook (Khuyên dùng khi phát triển UI)
```bash
npm run storybook
```
Truy cập: [http://localhost:6006](http://localhost:6006)

---

## 📂 Thư mục quan trọng

- `src/app`: Chứa logic routing và các trang (Pages).
- `src/shared/components`: Thư viện UI components dùng chung.
- `src/shared/hooks`: Các custom hooks dùng chung.
- `src/core`: Chứa các cấu hình hệ thống, constants và types.
- `src/modules`: Chứa logic theo từng tính năng nghiệp vụ (Auth, Booking, Charity...).

---

## 📜 Quy ước chung

### 1. Ghi chú Commit
Dự án sử dụng chuẩn **Conventional Commits**. Mọi commit phải có định dạng:
`<type>(<scope>): <mô tả ngắn bằng tiếng Anh>`

Ví dụ: `feat(shared): implement dropdown component`

### 2. Đặt tên Branch
`<type>/<tên-dev>/<scope>/<mô-tả-ngắn>`

Ví dụ: `feat/nghia/shared/dropdown-component`

---

© 2026 HocTuThien Development Team.
