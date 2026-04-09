# JWT Authentication Full Guide (NestJS)

Tài liệu này tổng hợp **từ ý tưởng đến code** để bạn triển khai JWT auth bài bản trong backend NestJS.

---

## 1) Mục tiêu kiến trúc

Xây auth theo mô hình:

- **Access Token**: sống ngắn (ví dụ `15m`), dùng để truy cập API.
- **Refresh Token**: sống dài hơn (ví dụ `7d`), dùng để cấp lại access token.
- Lưu **hash của refresh token** trong DB (không lưu plain token).
- Có cơ chế logout/revoke refresh token.

Flow chuẩn:

1. Login thành công -> trả `accessToken` + `refreshToken`
2. Access token hết hạn -> gọi refresh -> nhận cặp token mới
3. Logout -> xóa `refreshTokenHash` trong DB

---

## 2) Cài dependency

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm i -D @types/passport-jwt @types/bcrypt
```

---

## 3) ENV cần có

File `.env`:

```env
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret_32_plus_chars
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret_32_plus_chars
JWT_REFRESH_EXPIRES_IN=7d
```

Khuyến nghị:

- Secret tối thiểu 32 ký tự.
- Access secret và Refresh secret phải khác nhau.

---

## 4) Cập nhật config và validation

### 4.1 `src/config/env.config.ts`

```ts
export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});
```

### 4.2 `src/config/validation.ts`

```ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export const validateEnv = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  return result.data;
};
```

---

## 5) Entity user cần những cột gì

Tối thiểu nên có:

- `id` (uuid)
- `email` (unique)
- `passwordHash`
- `role` (optional)
- `refreshTokenHash` (nullable)
- `createdAt`, `updatedAt`, `deletedAt`

Ví dụ phần field auth:

```ts
@Column({ type: 'varchar', length: 255, unique: true })
email: string;

@Column({ name: 'password_hash', type: 'varchar', length: 255 })
passwordHash: string;

@Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
refreshTokenHash?: string | null;
```

---

## 6) Utility JWT dùng chung

Tạo file `src/common/utils/jwt.util.ts`:

```ts
import { sign, verify, JwtPayload, SignOptions } from 'jsonwebtoken';

export type AppJwtPayload = JwtPayload & {
  sub: string;
  email?: string;
  role?: string;
};

export const signToken = (
  payload: AppJwtPayload,
  secret: string,
  expiresIn: SignOptions['expiresIn'],
): string => {
  return sign(payload, secret, { expiresIn });
};

export const verifyToken = <T extends object = AppJwtPayload>(
  token: string,
  secret: string,
): T => {
  return verify(token, secret) as T;
};

export const parseBearerToken = (authorization?: string): string | null => {
  if (!authorization) return null;
  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
};
```

---

## 7) Decorator và Guard cơ bản

### 7.1 `src/common/decorators/public.decorator.ts`

```ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### 7.2 `src/common/decorators/current-user.decorator.ts`

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 7.3 `src/modules/auth/guards/jwt-auth.guard.ts`

```ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

---

## 8) Jwt Strategy

Tạo `src/modules/auth/strategies/jwt.strategy.ts`:

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtAccessPayload = {
  sub: string;
  email?: string;
  role?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtAccessPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

---

## 9) DTO cho auth

### `src/modules/auth/dtos/login.dto.ts`

```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### `src/modules/auth/dtos/refresh-token.dto.ts`

```ts
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

---

## 10) AuthService (core logic)

`src/modules/auth/services/auth.service.ts`:

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    // inject UsersService/UsersRepository tại đây
  ) {}

  private async signAccessToken(payload: {
    sub: string;
    email?: string;
    role?: string;
  }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn') || '15m',
    });
  }

  private async signRefreshToken(payload: { sub: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
    });
  }

  async login(email: string, password: string) {
    // 1) tìm user theo email
    // const user = await this.usersService.findByEmail(email);

    const user = null as any; // thay bằng logic thật
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2) compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // 3) sign token
    const accessToken = await this.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.signRefreshToken({ sub: user.id });

    // 4) hash refresh token và lưu DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    // await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    // const user = await this.usersService.findById(userId);
    const user = null as any; // thay bằng logic thật
    if (!user?.refreshTokenHash)
      throw new UnauthorizedException('Invalid refresh token');

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = await this.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await this.signRefreshToken({ sub: user.id });
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    // await this.usersService.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    // await this.usersService.updateRefreshTokenHash(userId, null);
    return { message: 'Logged out successfully' };
  }
}
```

---

## 11) AuthController

`src/modules/auth/auth.controller.ts`:

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    // nếu muốn chuẩn hơn: verify refresh token để lấy userId
    return this.authService.refresh('replace-user-id', dto.refreshToken);
  }

  @Post('logout')
  logout() {
    // lấy userId từ @CurrentUser() khi bạn nối guard xong
    return this.authService.logout('replace-user-id');
  }
}
```

---

## 12) AuthModule

`src/modules/auth/auth.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 13) Gắn Guard global

Trong `AppModule`, đăng ký global guard để mặc định route cần JWT trừ route có `@Public()`.

```ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
];
```

---

## 14) `main.ts` - ValidationPipe global

```ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

---

## 15) Checklist bảo mật production

- [ ] Access/Refresh secret khác nhau
- [ ] Secret đủ dài
- [ ] Không lưu refresh token plain text
- [ ] Xóa refresh hash khi logout
- [ ] Revoke token khi đổi password
- [ ] Rate limit `/auth/login`, `/auth/refresh`
- [ ] Không đưa thông tin nhạy cảm vào payload JWT

---

## 16) Test nhanh

1. `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

2. Gọi API protected:

```http
Authorization: Bearer <accessToken>
```

3. `POST /auth/refresh`

```json
{
  "refreshToken": "<refreshToken>"
}
```

4. `POST /auth/logout` -> refresh token cũ không dùng lại được.

---

## 17) Gợi ý nâng cấp

- Thêm `@Roles()` + `RolesGuard`
- Thêm `GET /auth/me` dùng `@CurrentUser()`
- Thêm refresh token rotation nâng cao
