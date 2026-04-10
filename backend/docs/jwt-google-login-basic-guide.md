# JWT + Google Login Guide (cơ bản, gọn)

Tài liệu này tập trung đúng 3 việc bạn đang làm:

1. Config JWT
2. Tạo `UserEntity` (extends `BaseEntity`, id bigint)
3. Làm login bằng Google

## 1) Config JWT

### 1.1 Cài package

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt google-auth-library
npm i -D @types/passport-jwt @types/bcrypt
```

### 1.2 Thêm env

```env
JWT_ACCESS_SECRET=replace_with_access_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
```

### 1.3 Cập nhật `env.config.ts`

```ts
jwt: {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
},
google: {
  clientId: process.env.GOOGLE_CLIENT_ID,
},
```

### 1.4 Cập nhật `validation.ts`

```ts
JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
```

## 2) `BaseEntity` dùng `bigint`

`src/common/entities/base.entity.ts`:

```ts
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
```

## 3) `UserEntity` đầy đủ và extends `BaseEntity`

`src/modules/user/entities/user.entity.ts`:

```ts
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  googleId?: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  phone?: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'day_of_birth', type: 'date', nullable: true })
  dayOfBirth?: string | null;

  @Column({ name: 'gender', type: 'varchar', length: 50, nullable: true })
  gender?: string | null;

  @Column({ name: 'timezone', type: 'varchar', length: 50, nullable: true })
  timezone?: string | null;

  @Column({ name: 'role', type: 'varchar', length: 50, default: 'mentee' })
  role: string;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'preferences', type: 'jsonb', nullable: true })
  preferences?: Record<string, unknown> | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshTokenHash?: string | null;
}
```

Nếu DB chưa có cột token:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255);
```

## 4) Google login flow

1. Frontend lấy `id_token` từ Google
2. Gọi `POST /auth/google` với `{ idToken }`
3. Backend verify bằng `GOOGLE_CLIENT_ID`
4. Lấy `sub/email/name/picture`
5. Tìm user theo `google_id`, nếu chưa có thì tạo user
6. Cấp `accessToken` + `refreshToken`
7. Hash refresh token và lưu `refresh_token_hash`

### DTO

```ts
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
```

## 5) Checklist ngắn

- [ ] JWT env/config/validation xong
- [ ] `BaseEntity` dùng bigint
- [ ] `UserEntity` extends `BaseEntity` và đủ field
- [ ] Có `refresh_token_hash`
- [ ] `POST /auth/google` verify thành công
- [ ] Lưu hash refresh token
