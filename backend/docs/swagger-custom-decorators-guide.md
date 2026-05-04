# Hướng dẫn sử dụng Custom Swagger Decorators

Tài liệu này hướng dẫn cách đóng gói các cấu hình Swagger cồng kềnh thành các Custom Decorators để giữ cho Controller luôn sạch sẽ và dễ bảo trì.

## 1. Tại sao nên dùng Custom Swagger Decorators?

Khi API có Request Body hoặc Response Schema phức tạp (đặc biệt khi không dùng Class DTO mà dùng Zod), việc viết trực tiếp các decorator như `@ApiBody`, `@ApiResponse` vào Controller sẽ làm code bị phình to và rất khó đọc.

Việc tách ra file riêng giúp:
- **Controller sạch sẽ**: Chỉ tập trung vào routing và xử lý logic.
- **Tái sử dụng**: Có thể dùng lại các schema hoặc decorator ở nhiều nơi.

## 2. Cách tạo Custom Decorator

Tạo một thư mục `swagger` trong module tương ứng và tạo file (ví dụ: `user.swagger.ts`).

Sử dụng `applyDecorators` từ `@nestjs/common` để gộp các decorator Swagger:

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export const ApiGetMeDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin user thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                // ...
              }
            }
          }
        }
      }
    })
  );
};
```

## 3. Cách sử dụng trong Controller

Import decorator vừa tạo và gắn trực tiếp vào endpoint:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetMeDoc } from './swagger/user.swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetMeDoc() // <- Sử dụng tại đây
  async getMe(@User('id') userId: string) {
    // ...
  }
}
```

## 4. Quy chuẩn cấu trúc Response

Do hệ thống sử dụng `ResponseTransformInterceptor` để chuẩn hóa dữ liệu trả về, cấu trúc Response trong Swagger nên phản ánh đúng định dạng này:

```typescript
{
  data: any[], // Luôn là mảng (trừ trường hợp pagination)
  meta: object,
  error: string | null
}
```
