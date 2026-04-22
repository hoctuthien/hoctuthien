import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('google.clientId') || configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('google.clientSecret') || configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('google.callbackUrl') || configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientId) {
      console.error('❌ LỖI: GOOGLE_CLIENT_ID không được tìm thấy trong cấu hình!');
    }

    super({
      clientID: clientId || 'dummy-id', // Tránh crash lúc khởi tạo nếu config chưa load kịp
      clientSecret: clientSecret || 'dummy-secret',
      callbackURL: callbackURL || 'http://localhost:5050/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      avatarUrl: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
