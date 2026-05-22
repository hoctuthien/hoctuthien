import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  Ip,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { LoginDto, GoogleTokenDto, RegisterDto } from './dtos/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiRegisterDoc,
  ApiLoginDoc,
  ApiRefreshTokensDoc,
  ApiLogoutDoc,
  ApiTestRedisDoc,
  ApiGoogleAuthDoc,
  ApiGoogleAuthCallbackDoc,
  ApiGoogleTokenLoginDoc,
} from './swagger/auth.swagger';

@ApiTags('Auth')
@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiRegisterDoc()
  @ApiRegisterDoc()
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const deviceId = req.cookies['device_id'] || req.headers['x-device-id'];
    return this.authService.register(registerDto, {
      ip,
      deviceId: deviceId as string,
    });
  }

  @Public()
  @Post('login')
  @ApiLoginDoc()
  @ApiLoginDoc()
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const deviceId = req.cookies['device_id'] || req.headers['x-device-id'];
    return this.authService.login(loginDto, {
      ip,
      deviceId: deviceId as string,
    });
  }

  @Public()
  @Post('refresh')
  @ApiRefreshTokensDoc()
  @ApiRefreshTokensDoc()
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    const deviceId = req.cookies['device_id'] || req.headers['x-device-id'];
    return this.authService.refreshTokens(refreshToken, deviceId as string);
  }

  @Post('logout')
  @ApiLogoutDoc()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    const deviceId = req.cookies['device_id'] || req.headers['x-device-id'];

    await this.authService.logout(
      accessToken,
      refreshToken,
      deviceId as string,
    );

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  @Public()
  @Get('test-redis')
  @ApiTestRedisDoc()
  async testRedis() {
    return this.authService.testRedis();
  }

  @Public()
  @Get('google')
  @ApiGoogleAuthDoc()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any) {
    // Passport sẽ tự động chuyển hướng sang Google
  }

  @Public()
  @Get('google/callback')
  @ApiGoogleAuthCallbackDoc()
  @UseGuards(GoogleAuthGuard)
  @ApiGoogleAuthCallbackDoc()
  async googleAuthRedirect(@Req() req: any) {
    const deviceId = req.cookies['device_id'] || req.headers['x-device-id'];
    return this.authService.validateGoogleUser(req.user, deviceId as string);
  }

  @Public()
  @Post('google/token')
  @ApiGoogleTokenLoginDoc()
  @ApiGoogleTokenLoginDoc()
  async googleTokenLogin(
    @Body() googleTokenDto: GoogleTokenDto,
    @Req() req: Request,
  ) {
    const deviceId = req.cookies['device_id'] || req.headers['x-device-id'];
    return this.authService.verifyGoogleToken(
      googleTokenDto.token,
      deviceId as string,
    );
  }
}
