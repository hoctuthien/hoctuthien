# Backend NestJS Start Guide

## Mục tiêu
Tài liệu tóm tắt các nội dung đã trao đổi:
- Kết nối PostgreSQL bằng URL
- Giải thích `AppModule` và `DatabaseModule`
- Phân biệt `forRoot()` và `isGlobal`
- Việc nên làm sau khi kết nối DB
- Cách tạo module `users` bằng Hygen
- Cách chạy project

## 1) Kết nối PostgreSQL bằng URL

Cài package:

```bash
npm i @nestjs/typeorm typeorm pg @nestjs/config
```

Tạo `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
NODE_ENV=development
```

Ví dụ:

```env
DATABASE_URL=postgresql://postgres:123456@localhost:5432/myapp
NODE_ENV=development
```

## 2) `AppModule` là gì?

`src/app.module.ts` là root module của ứng dụng.

- `ConfigModule.forRoot(...)` khởi tạo config (load env, validate)
- `isGlobal: true` cho phép dùng `ConfigService` toàn app
- `DatabaseModule` chứa cấu hình kết nối DB

## 3) `DatabaseModule` là gì?

`src/infrastructure/database/database.module.ts` cấu hình TypeORM:

- `forRootAsync` để inject `ConfigService`
- `type: 'postgres'`
- `url: configService.get<string>('database.url')`
- `autoLoadEntities: true`
- `synchronize`: bật ở non-prod
- `logging`: bật ở development

## 4) Vì sao có `isGlobal` vẫn cần `forRoot()`?

- `forRoot()` = khởi tạo module config
- `isGlobal` = phạm vi dùng module sau khi khởi tạo

Không có `forRoot()` thì chưa có `ConfigService` để dùng.

## 5) Tóm lại `forRoot()` làm gì?

`forRoot()` tạo cấu hình gốc cho module (singleton toàn app).

Với ConfigModule:
- đọc `.env`
- load custom config
- validate env
- tạo `ConfigService`

## 6) Sau khi kết nối DB, nên làm gì?

1. Tạo module nghiệp vụ đầu tiên (`users`)
2. Tạo `UserEntity` theo schema thật
3. Tạo DTO cho create/update/query
4. Viết CRUD service/controller
5. Bật validation pipe global
6. Dùng migration sớm

## 7) Tạo module users bằng Hygen

Project đang có script:

```bash
npm run gen:module -- <module-name> [route]
```

Tạo users:

```bash
npm run gen:module -- user users
```

Sau khi generate:
1. Import `UserModule` vào `AppModule`
2. Sửa `user.entity.ts` theo cột thực tế từ SQL
3. Tách DTO (`create-user.dto.ts`, `update-user.dto.ts`)
4. Nâng service/controller từ skeleton thành CRUD đầy đủ

## 8) Cách chạy project

```bash
npm install
npm run start:dev
```

Build:

```bash
npm run build
```

Run production:

```bash
npm run start:prod
```

## 9) Checklist khi lỗi kết nối DB

- PostgreSQL đã chạy?
- `DATABASE_URL` đúng chưa?
- DB đã tạo chưa?
- Key config có map đúng `database.url` chưa?
- `NODE_ENV` có đúng không?
