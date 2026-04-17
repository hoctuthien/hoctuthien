import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dtos/auth.dto';

@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API Đăng nhập
  @Post('login')
  @HttpCode(HttpStatus.OK) // Trả về mã 200
  async login(@Body() loginDto: LoginDto) {
    // Gọi sang hàm login mà chúng ta đã xử lý ở AuthService
    return this.authService.login(loginDto);
  }
}
