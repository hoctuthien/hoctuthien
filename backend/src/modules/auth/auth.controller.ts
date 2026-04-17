// src/modules/auth/auth.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Inject,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dtos/auth.dto';
import { REDIS_CLIENT } from '../redis/redis.module'; // Đảm bảo đường dẫn này đúng
import { Redis } from 'ioredis';

@Controller('auths')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // Tiêm Redis vào đây để test nhanh
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // 1. API Đăng nhập (vẫn giữ nguyên)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 2. THÊM API TEST NÀY VÀO
  @Get('test-redis')
  async testRedis() {
    try {
      // Thử ghi và đọc để kiểm tra kết nối
      await this.redis.set('nest_test', 'SUCCESS', 'EX', 60);
      const data = await this.redis.get('nest_test');

      return {
        status: 200,
        result: data,
        message: 'Kết nối Redis thành công hehe!',
      };
    } catch (e) {
      return {
        status: 500,
        message: 'Lỗi kết nối Redis rùi!',
        error: e.message,
      };
    }
  }
}
