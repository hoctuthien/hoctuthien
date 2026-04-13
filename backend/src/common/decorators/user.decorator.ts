import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../types/user-payload.type';
 // Import interface vừa tạo

export const User = createParamDecorator(
  // data chỉ được phép là một trong các key của UserPayload
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user: UserPayload = request.user;

    // Nếu truyền @User('email') -> data = 'email' -> trả về user['email']
    return data ? user?.[data] : user;
  },
);

// createParamDecorator: hàm của NestJS  dùng để tạo các "nhãn" gắn vào tham số của hàm.
//**
// ExecutionContext: Trong NestJS, một request có thể là HTTP, Websocket hoặc Microservice.
//                   Đóng vai trò là một "chiếc hộp" chứa thông tin request đó.
// ctx.switchToHttp().getRequest(): Dòng này ra lệnh cho NestJS:
//                   "Hãy mở chiếc hộp đó ra dưới dạng giao thức HTTP để lấy thông tin Request".
// request.user: Đây là quy chuẩn. Các thư viện xác thực (như Passport)
//              hoặc các AuthGuard tự viết thường sẽ đính kèm thông tin người dùng vào biến user
//              nằm trong request sau khi kiểm tra Token thành công.
// Bracket Notation: user[data]
