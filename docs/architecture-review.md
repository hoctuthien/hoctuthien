# Đánh Giá Kiến Trúc & Tiến Độ Dự Án HocTuThien

> Tài liệu review ngày 2026-04-21, dựa trên nhánh `main` tại commit `4c42e56`.

## 1. Tổng Quan Cấu Trúc

Dự án là monorepo gồm:

- `backend/` — NestJS 11 + TypeORM + PostgreSQL + Redis
- `frontend/` — Next.js 16 (App Router) + React 19 + TypeScript
- `packages/` — 4 shared libs: `shared-types`, `shared-utils`, `shared-validators`, `shared-constants`
- `docs/` — tài liệu quy ước (branch/commit) và review này
- `docker-compose.yml` — service orchestration cho dev

## 2. Điểm Mạnh Kiến Trúc

### Backend
- **Cấu trúc module chuẩn NestJS**: mỗi module có `controller`, `service`, `repository`, `entity`, `dto`, `schema`, `interface`, `types`
- **Env validation** bằng Zod (`backend/src/config/env.config.ts`, `backend/src/config/validation.ts`)
- **Auth infrastructure**: JWT (access + refresh) + Passport + bcrypt, `DeviceGuard`, `SessionEntity`, `UserSessionEntity` track refresh token theo device
- **Common layer**: `HttpExceptionFilter`, `TraceIdMiddleware`, `ResponseTransformInterceptor`, error/message constants
- **Base repository pattern** (`backend/src/common/repositories/base.repository.ts`)
- **Code generators** (`hygen`, `gen-module.js`)
- **Documentation nội bộ tốt**: `backend/docs/` có 7 guides (api-standards, request-response-flow, jwt-full-guide, pipes-guide, response-transform-guide, user-development-guide, backend-start-guide)

### Frontend
- **Layered architecture enforced bằng ESLint** (`frontend/eslint.config.mjs:53-90`):
  - `shared` không được import từ `core`/`modules`/`app`
  - `core` không được import từ `modules`/`app`
  - Module `index.ts` gating
- **BFF 3-layer pattern**:
  - Layer 1: Client component
  - Layer 2: API Route Handler (`app/api/*/route.ts`)
  - Layer 3: Gateway (`core/gateway/*`) gọi `apiService`
- **UI kit** được tổ chức dưới `core/ui/` (Button, Input, Select, Dropdown, Modal, DataTable, v.v.)
- **Auth UI** hoàn chỉnh: login page với form validation, show/hide password, remember me, Google button, auth layout riêng với background image
- **Constants tập trung**: `shared/constants/{messages,ui,api,colors}.ts`

### Tooling & Infra
- Husky + Commitlint (scope đã định nghĩa trong `commitlint.config.js`)
- Frontend Dockerfile + `.dockerignore`
- Backend Dockerfile multi-stage (Node 20-alpine, curl healthcheck)
- GitHub Actions workflow deploy Coolify

## 3. Tiến Độ Nghiệp Vụ

| Tính năng | Backend | Frontend | E2E |
|-----------|---------|----------|-----|
| Login email/password | ✅ Done (JWT + bcrypt + DB) | ⚠️ Form UI hoàn chỉnh, API vẫn mock | ❌ Chưa connect |
| Register | ❌ Chưa có endpoint | ❌ Trang trống | ❌ |
| Google OAuth | ⚠️ `upsertGoogleUser` logic có, chưa có OAuth flow | ⚠️ Button UI, callback mock | ❌ |
| Refresh token | ⚠️ Generate nhưng không persist | ❌ | ❌ |
| Course CRUD | ❌ Service stub `{id, message}` | ❌ Placeholder | ❌ |
| Course Booking | ❌ Stub | ❌ Không có page | ❌ |
| Course Review | ❌ Stub | ❌ | ❌ |
| Payment/Donation | ❌ Stub | ⚠️ API route trả `[]`, gateway comment | ❌ |
| Notification | ❌ Stub | ❌ | ❌ |
| Conversation/Chat | ❌ Stub | ❌ | ❌ |

**Kết luận nghiệp vụ**: Đang ở giai đoạn hoàn thiện flow đăng nhập. Core domain (Course + Booking) chưa khởi động.

## 4. Vấn Đề Tồn Đọng

### Critical

| # | Vấn đề | Vị trí |
|---|--------|--------|
| C1 | Shared packages `packages/shared-*` không được khai báo trong `backend/package.json` hay `frontend/package.json`, root không có `workspaces` — dead code | `package.json` |
| C2 | Test coverage gần như bằng 0 — chỉ 2 file `.spec.ts` trong backend (`app.controller.spec.ts`, `password.util.spec.ts`), frontend 0 test | — |
| C3 | Không có DB migrations — TypeORM `synchronize: true` → schema drift rủi ro khi lên prod | `backend/src/database/database.module.ts:14` |

### High

| # | Vấn đề | Vị trí |
|---|--------|--------|
| H1 | LoginForm không gọi API thật, vẫn dùng `setTimeout(1500)` mock | `frontend/src/app/(auth)/login/_components/LoginForm.tsx:84` |
| H2 | Refresh token không lưu DB (code bị comment out) dù `UserSessionEntity` đã tạo | `backend/src/modules/auth/services/auth.service.ts:64-66` |
| H3 | `UserSessionService` chưa được wire vào login flow | `backend/src/modules/auth/services/auth.service.ts` |
| H4 | Google OAuth FE stub, chưa có provider setup | `frontend/src/app/(auth)/login/_components/LoginForm.tsx:98` |
| H5 | TypeScript `strict` mismatch — backend `false`, frontend `true` | `backend/tsconfig.json`, `frontend/tsconfig.json` |
| H6 | CI không có test/lint gate — workflow chỉ trigger Coolify deploy | `.github/workflows/main.yml` |
| H7 | Register flow chưa có (BE endpoint + FE form) | — |

### Medium

| # | Vấn đề | Vị trí |
|---|--------|--------|
| M1 | Endpoint debug `GET /auths/test-redis` lộ trong controller | `backend/src/modules/auth/auth.controller.ts:30-44` |
| M2 | `process.env` truy cập trực tiếp trong auth service thay vì qua `ConfigService` | `backend/src/modules/auth/services/auth.service.ts:56,61` |
| M3 | File rác `frontend/src/lint-test.ts` còn trong repo | `frontend/src/lint-test.ts` |
| M4 | Secrets hardcode `user/pass` trong `docker-compose.yml` | `docker-compose.yml` |
| M5 | Frontend chưa có state management layer (Zustand/Redux/Context) dù đã có React Query | — |
| M6 | Không có Swagger/OpenAPI cho API docs tự sinh | — |
| M7 | Git history noisy — 10+ commit `config: deployy` lặp, `feat(befe): test test`, v.v. | — |
| M8 | Donation gateway bị comment out, route trả array rỗng | `frontend/src/app/api/donations/route.ts:11` |

## 5. Khuyến Nghị Theo Thứ Tự Ưu Tiên

### Sprint hiện tại (1–2 tuần) — Đóng E2E auth flow

1. **Wire LoginForm → backend** (nửa ngày): gọi thật `POST /auths/login`, lưu access token vào client, handle error state
2. **Persist refresh token qua UserSession** (1 ngày): bỏ comment ở `auth.service.ts:64-66`, dùng `UserSessionService.create` với device/IP/UA metadata
3. **Implement Register flow** (1–2 ngày): BE endpoint `POST /auths/register` + FE form trang `/register`
4. **Refresh token endpoint** (1 ngày): `POST /auths/refresh` rotate token, validate qua `UserSession`
5. **Logout endpoint** (nửa ngày): revoke session (set `revokedAt`)
6. **Xóa `test-redis` endpoint và file `lint-test.ts`** (15 phút)

### Sprint tiếp theo — Core domain

7. **Course CRUD thật** (2–3 ngày): mentor tạo/sửa/xóa course, mentee list + detail
8. **Course Booking flow** (2 ngày): booking → confirm → change status, notification
9. **Course Review** (1 ngày): mentee review sau buổi học
10. **Course detail page FE** (2 ngày): hiển thị thông tin, book button

### Technical debt — song song

11. **Bật TypeORM migrations**, `synchronize: false` ở prod (1 ngày)
12. **Tích hợp shared packages** — thêm `workspaces` vào root `package.json`, build pipeline (2h)
13. **Thêm CI test/lint gate** (2h): `npm run lint && npm test` trước khi merge
14. **Bật TypeScript `strict: true`** ở backend + fix errors (1 ngày)
15. **Thêm Swagger** `@nestjs/swagger` (2h)
16. **Dọn git history** — bỏ commit `config: deployy` lặp qua rebase (tùy chọn)

## 6. Tóm Tắt

**Điểm tốt**: Nền tảng kiến trúc vững — modular NestJS, layered Next.js với ESLint enforcement, BFF pattern, auth infrastructure (JWT + session + device tracking) đã thiết kế đúng hướng, docs backend chi tiết.

**Điểm yếu**: E2E flow chưa thông — login UI không gọi API thật, 7/10 module business vẫn là stub, test coverage ≈ 0, migration chưa bật.

**Gap lớn nhất**: Frontend và backend chưa tích hợp thực sự (login form vẫn mock). Giải quyết gap này là tiền đề để mở rộng sang Course/Booking — core domain của sản phẩm.

**Thời gian ước tính đến MVP functional**: 2–3 tuần nếu team tập trung vào các hạng mục Sprint 1 + core domain Sprint 2.

---

# Cập Nhật Review — 2026-04-23

> Dựa trên `main` tại commit `1dc0241`. Delta so với review trước (`4c42e56`): **145 files, +3078 / -600 dòng**.

## 7. Bổ Sung Từ Lần Trước

### Backend — 7 module mới đầy đủ CRUD

Đã wire vào `app.module.ts:28-50`:

| Module | Entity / Đặc điểm |
|--------|-------------------|
| `category/` | Danh mục gốc |
| `course-category/` | Mapping course ↔ category |
| `mentor-profile/` | `jobTitle`, `company`, `bio`, `linkedinUrl`, `skills[]`, `averageRating`, `totalStudents`, `isApproved`, `approvedBy` FK |
| `mentor-availability/` | `dayOfWeek`, `startTime`, `endTime`, `isActive` |
| `message/` | Message trong conversation |
| `user-review/` | Review giữa user (mentor ↔ mentee) |
| `penalty-ticket/` | `reason`, `pointsDeducted`, `evidenceUrl` |
| `system-config/` | Config hệ thống |

### Course module đã thoát stub

- `CourseService` (`backend/src/modules/course/services/course.service.ts`): CRUD thực qua `CourseRepository` (`findAll`, `findOne`, `create`, `update`, `remove`)
- `CourseController`: 5 endpoints REST đầy đủ
- `CourseEntity` có relationship `@ManyToOne UserEntity` cho `mentorId` + `approvedBy`, `price decimal(15,2)`, `durationMinutes`, `prerequisites jsonb`

### Cải tiến kiến trúc

- `UserRole` enum (`MENTEE`/`MENTOR`/`ADMIN`) — `user.entity.ts:5-9`
- Database module dời sang `backend/src/infrastructure/database/`, `synchronize` đọc từ env config (không còn hardcode `true`)
- Entities mới có FK relationships đúng chuẩn (`@ManyToOne`/`@OneToOne` + `onDelete: CASCADE/SET NULL`)

### Frontend

- Root page `/` có landing hoàn chỉnh: logo bounce, CTA Login/Register — `app/page.tsx`
- Branding: `avatar_logo.png`, `avatar_browser.png`, `avatar_link.png`
- Next.js standalone mode + favicon cho Docker deploy
- Login UX fixes: eye icon interactivity, logo home link
- Chuyển toàn bộ UI labels sang tiếng Việt

## 8. Vấn Đề Từ Review Cũ **CHƯA Giải Quyết**

| # cũ | Trạng thái |
|------|-----------|
| H1 LoginForm mock | **Y NGUYÊN** — `LoginForm.tsx:84` vẫn `setTimeout` |
| H2 Refresh token không lưu DB | **TỆ HƠN** — code comment intent cũ đã bị xóa hẳn |
| H3 UserSessionService chưa wire | Y NGUYÊN |
| H4 Google OAuth stub | Y NGUYÊN |
| H7 Register flow | Y NGUYÊN |
| M1 `/auths/test-redis` endpoint | Y NGUYÊN — vẫn public |
| M2 `process.env` trực tiếp | **TỆ HƠN** — thêm fallback hardcode `\|\| '1h'`, `\|\| '7d'` tại `auth.service.ts:52,56` |
| M3 File rác `lint-test.ts` | Y NGUYÊN |
| C1 Shared packages không dùng | Y NGUYÊN — root `package.json` không có `workspaces` |
| C2 Test coverage ≈ 0 | Y NGUYÊN — 2 file spec |
| C3 TypeORM migrations | Y NGUYÊN |

## 9. Vấn Đề Mới Phát Sinh

| # | Mô tả | Mức độ |
|---|-------|--------|
| N1 | **Zero authorization guards** trên toàn bộ endpoint mới (course, mentor-profile, category, penalty-ticket...). Ai cũng tạo/sửa/xóa/approve được | 🔴 Critical |
| N2 | **DB credentials thật leak trong comment** `infrastructure/database/database.module.ts:15-18` — IP `103.161.16.77`, user `admin`, password `dungthaydoimatkhau`, db `hoctuthien_v1`. Git history giữ vĩnh viễn | 🔴 Critical |
| N3 | `synchronize` vẫn có thể bật ở prod (qua env) + `logging: true` cứng luôn → ồn ào, rò rỉ SQL | 🟠 High |
| N4 | Có field `approvedBy` ở Course + MentorProfile nhưng **không có endpoint approve** → workflow phê duyệt thiếu | 🟠 High |
| N5 | Services không load `relations` (tất cả `findMany`/`findById` trả flat data) — client không truy cập được mentor thông qua course | 🟡 Medium |
| N6 | Git history thêm commits rác: `feat(be): deploy heheheheheheehehhe`, `feat(be): loi loi bug bug bug a`, 3× `config: deploy` | 🟡 Medium |

## 10. Hành Động Cấp Bách

1. **[URGENT] Xóa dòng comment leak DB credentials** (`infrastructure/database/database.module.ts:15-18`) + **đổi password DB** — credentials đã vĩnh viễn trong git history
2. Nếu repo từng public: rotate tất cả secrets (JWT, DB, Redis, Google OAuth)
3. Scan git history cho leak khác: `git log -p -S 'dungthaydoimatkhau'`
4. Thêm `JwtAuthGuard` + `RolesGuard` cho toàn bộ write endpoints trước khi mở module mới
5. `synchronize` cứng `false` ở prod (không đọc từ env), tắt `logging` ngoài dev

## 11. Cập Nhật Tình Trạng Nghiệp Vụ

| Tính năng | Trước | Giờ |
|-----------|-------|-----|
| Login E2E | ❌ | ❌ (FE vẫn mock) |
| Register | ❌ | ❌ |
| Course CRUD BE | ❌ stub | ✅ (chưa có auth) |
| Mentor Profile | ❌ | ✅ (chưa có auth) |
| Mentor Availability | ❌ | ✅ |
| Category / CourseCategory | ❌ | ✅ |
| Message | ❌ | ✅ |
| User Review | ❌ | ✅ |
| Penalty Ticket | ❌ | ✅ |
| System Config | ❌ | ✅ |
| Course Booking BE | ❌ stub | ⚠️ vẫn stub |
| Payment | ❌ stub | ⚠️ vẫn stub |
| Notification | ❌ stub | ⚠️ vẫn stub |
| FE pages ngoài login/homepage | ❌ | ❌ |

## 12. Đánh Giá

**Tốt**: Team đang build schema dữ liệu rất nhanh — 7 module mới trong 1 sprint, entities thiết kế có relationships đúng chuẩn. Core domain data layer gần như xong.

**Lo ngại**:
- Tốc độ thêm module mới **lớn hơn nhiều** tốc độ đóng E2E flow và xử lý issues cũ. Tất cả vấn đề review trước vẫn nguyên, có mục còn tệ hơn.
- Zero authorization trên toàn bộ API mới là lỗ hổng nghiêm trọng — dễ sửa bây giờ, càng để lâu càng đắt
- Leak credentials là sự cố bảo mật cần xử lý ngay

**Khuyến nghị điều chỉnh hướng**: **Dừng thêm module mới** cho đến khi:
1. Fix credential leak + rotate password
2. Thêm auth guard cho toàn bộ endpoint hiện có
3. Wire FE login vào BE thật
4. Enable TypeORM migrations

Sau đó mới tiếp tục Course Booking / Payment / Notification.
