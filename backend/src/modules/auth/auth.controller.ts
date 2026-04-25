import { Controller, Post, Body, Get, UseGuards, UseInterceptors, Ip, Headers, Req, Res } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { LoginDto, GoogleTokenDto, RegisterDto } from './dtos/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { SetCookie } from 'src/common/decorators/set-cookie.decorator';
import { SetCookieInterceptor } from 'src/common/interceptors/set-cookie.interceptor';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';

@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseInterceptors(SetCookieInterceptor)
  @SetCookie([
    { name: 'access_token', field: 'access_token', options: { maxAge: 15 * 60 * 1000 } },
    { name: 'refresh_token', field: 'refresh_token', options: { maxAge: 7 * 24 * 60 * 60 * 1000 } },
  ])
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    return this.authService.register({ ...registerDto, deviceId }, { ip });
  }

  @Public()
  @Post('login')
  @UseInterceptors(SetCookieInterceptor)
  @SetCookie([
    { name: 'access_token', field: 'access_token', options: { maxAge: 15 * 60 * 1000 } },
    { name: 'refresh_token', field: 'refresh_token', options: { maxAge: 7 * 24 * 60 * 60 * 1000 } },
  ])
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    return this.authService.login({ ...loginDto, deviceId }, { ip });
  }

  @Public()
  @Post('refresh')
  @UseInterceptors(SetCookieInterceptor)
  @SetCookie([
    { name: 'access_token', field: 'access_token', options: { maxAge: 15 * 60 * 1000 } },
    { name: 'refresh_token', field: 'refresh_token', options: { maxAge: 7 * 24 * 60 * 60 * 1000 } },
  ])
  async refresh(
    @Req() req: Request,
    @Headers('x-device-id') deviceId: string,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.refreshTokens(refreshToken, deviceId);
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-device-id') deviceId: string,
  ) {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    
    await this.authService.logout(accessToken, refreshToken, deviceId);
    
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  @Public()
  @Get('test-redis')
  async testRedis() {
    return this.authService.testRedis();
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any) {
    // Passport sẽ tự động chuyển hướng sang Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(SetCookieInterceptor)
  @SetCookie([
    { name: 'access_token', field: 'access_token', options: { maxAge: 15 * 60 * 1000 } },
    { name: 'refresh_token', field: 'refresh_token', options: { maxAge: 7 * 24 * 60 * 60 * 1000 } },
  ])
  async googleAuthRedirect(@Req() req: any) {
    const result = await this.authService.validateGoogleUser(req.user);
    return {
      message: result.message,
      user: result.user,
    };
  }

  @Public()
  @Post('google/token')
  @UseInterceptors(SetCookieInterceptor)
  @SetCookie([
    { name: 'access_token', field: 'access_token', options: { maxAge: 15 * 60 * 1000 } },
    { name: 'refresh_token', field: 'refresh_token', options: { maxAge: 7 * 24 * 60 * 60 * 1000 } },
  ])
  async googleTokenLogin(
    @Body() googleTokenDto: GoogleTokenDto,
    @Headers('x-device-id') deviceId: string,
  ) {
    const result = await this.authService.verifyGoogleToken(googleTokenDto.token, deviceId);
    return {
      message: result.message,
      user: result.user,
    };
  }
}
