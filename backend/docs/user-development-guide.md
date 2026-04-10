# User Module Development Guide

Tài liệu này mô tả riêng phần phát triển `User` module trong backend NestJS của bạn.

## 1) Mục tiêu module `user`

- Quản lý thông tin hồ sơ người dùng theo bảng `users`
- Dùng chung cho flow đăng nhập Google
- Hỗ trợ lưu `refresh_token_hash` cho JWT refresh flow
- Chuẩn hóa validate bằng **Zod** và suy luận type bằng `z.infer`

---

## 2) Cấu trúc file hiện tại

```text
src/modules/user/
  user.module.ts
  user.controller.ts
  entities/
    user.entity.ts
  repositories/
    user.repository.ts
  services/
    user.service.ts
  schema/
    user.schema.ts
  types/
    user.types.ts
  interfaces/
    user.service.interface.ts
```

---

## 3) Entity chuẩn

File: `src/modules/user/entities/user.entity.ts`

`UserEntity` đã `extends BaseEntity` và map đủ field chính:
- `googleId`, `name`, `email`, `phone`, `avatarUrl`
- `dayOfBirth`, `gender`, `timezone`
- `role`, `points`, `isVerified`, `status`
- `preferences`, `metadata`
- `refreshTokenHash`

Lưu ý:
- `id`, `createdAt`, `updatedAt`, `deletedAt` đến từ `BaseEntity`
- `BaseEntity` của bạn đang dùng `bigint`

---

## 4) Zod schema + infer type

### 4.1 Schema

File: `src/modules/user/schema/user.schema.ts`

Các schema chính:
- `userRoleSchema`
- `userStatusSchema`
- `userSchema`
- `createUserSchema`
- `updateUserSchema`
- `googleUserProfileSchema`
- `updateRefreshTokenSchema`

### 4.2 Types từ Zod

File: `src/modules/user/types/user.types.ts`

Tạo type bằng `z.infer`:
- `User`
- `CreateUserInput`
- `UpdateUserInput`
- `GoogleUserProfile`
- `UpdateRefreshTokenInput`
- `UserRole`, `UserStatus`

Mục tiêu: 1 nguồn sự thật cho cả validate runtime + type compile-time.

---

## 5) Repository layer

File: `src/modules/user/repositories/user.repository.ts`

`UserRepository` kế thừa `BaseRepository<UserEntity>` và có helper:
- `findByEmail(email)`
- `findByGoogleId(googleId)`

Điều này giúp service không phải lặp query base.

---

## 6) Service layer

File: `src/modules/user/services/user.service.ts`

Các method cơ bản đã có:
- `findOne(id)`
- `findByEmail(email)`
- `findByGoogleId(googleId)`
- `create(payload)`
- `update(id, payload)`
- `updateRefreshTokenHash(userId, refreshTokenHash)`
- `upsertGoogleUser(profile)`

Tất cả input được parse qua Zod trước khi xử lý.

---

## 7) Controller endpoints

File: `src/modules/user/user.controller.ts`

Endpoints hiện tại:
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `POST /users/google-upsert`

Ghi chú:
- `google-upsert` là endpoint kỹ thuật để phục vụ luồng Google login trước khi tách sang `auth` module hoàn chỉnh.

---

## 8) Module wiring

### 8.1 UserModule

File: `src/modules/user/user.module.ts`

Đã đăng ký:
- `TypeOrmModule.forFeature([UserEntity])`
- `UserController`
- `UserService`, `UserRepository`

### 8.2 AppModule

File: `src/app.module.ts`

Đã import `UserModule` vào root module.

---

## 9) SQL cần có

Đảm bảo bảng `users` có cột:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255);
```

---

## 10) Quy ước phát triển tiếp

1. Validate input bằng Zod schema trước khi thao tác DB.
2. Chỉ export types thông qua `z.infer` từ schema.
3. Logic truy vấn đặt ở repository, business đặt ở service.
4. Tránh trả trực tiếp entity thô nếu cần ẩn trường nhạy cảm (sau này có thể thêm mapper/response DTO).
5. Khi thêm field mới vào `users`, cập nhật theo thứ tự:
   - `user.entity.ts`
   - `user.schema.ts`
   - `user.types.ts`
   - `user.service.ts` (nếu liên quan create/update)

---

## 11) Bước tiếp theo đề xuất

- Tạo `auth` module chính thức:
  - `POST /auth/google`
  - verify Google ID token
  - gọi `userService.upsertGoogleUser(...)`
  - phát `accessToken` + `refreshToken`
  - lưu hash refresh token qua `updateRefreshTokenHash(...)`

- Thêm guard/decorator:
  - `JwtAuthGuard`
  - `@Public()`
  - `@CurrentUser()`

- Thêm migration cho cột/index còn thiếu (nếu chưa có).
