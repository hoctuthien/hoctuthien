import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dtos/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('test-redis')
  async testRedis() {
    return this.authService.testRedis();
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any) {
    // Passport sẽ tự động chuyển hướng sang Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any) {
    // req.user sẽ chứa dữ liệu từ GoogleStrategy.validate()
    return this.authService.validateGoogleUser(req.user);
  }
}
