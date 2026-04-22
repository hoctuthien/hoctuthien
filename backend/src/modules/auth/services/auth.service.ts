import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from '../../user/entities/user.entity';
import { UserSessionEntity } from '../../user-session/entities/user-session.entity';
import { LoginDto } from '../dtos/auth.dto';
import { IAuthService } from '../interfaces/auth.service.interface';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { REDIS_CLIENT } from 'src/modules/redis/redis.module';
import Redis from 'ioredis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements IAuthService {
  private googleClient: OAuth2Client;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserSessionEntity)
    private readonly sessionRepository: Repository<UserSessionEntity>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId') || process.env.GOOGLE_CLIENT_ID,
    );
  }

  private async createSession(userId: string, refreshToken: string, deviceId?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Mặc định 7 ngày

    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      deviceName: deviceId || 'unknown',
      refreshTokenExpiresAt: expiresAt,
      lastUsedAt: new Date(),
      status: 'active',
    });

    return this.sessionRepository.save(session);
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: this.configService.get<string>('google.clientId') || process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Token Google không hợp lệ');
      }

      const googleUser = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture,
      };

      return this.validateGoogleUser(googleUser);
    } catch (error) {
      throw new UnauthorizedException('Xác thực Google thất bại: ' + error.message);
    }
  }

  async testRedis() {
    await this.redis.set('my_key', 'hello_redis', 'EX', 10);
    const value = await this.redis.get('my_key');
    console.log('Giá trị lấy từ Redis là:', value);
    return value;
  }

  async login(loginDto: LoginDto) {
    const { email, password, deviceId } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const payload = { sub: user.id, email: user.email, role: user.role, deviceId };
    return this.generateTokens(payload);
  }

  async validateGoogleUser(googleUser: any) {
    const { googleId, email, name, avatarUrl } = googleUser;

    let user = await this.userRepository.findOne({
      where: [{ googleId }, { email }],
    });

    if (!user) {
      user = this.userRepository.create({
        googleId,
        email,
        name,
        avatarUrl,
        role: UserRole.MENTEE,
        status: 'active',
        isVerified: true,
      });
      await this.userRepository.save(user);
    } else if (!user.googleId) {
      await this.userRepository.update(user.id, { googleId, avatarUrl });
      user = (await this.userRepository.findOne({ where: { id: user.id } }))!;
    }

    const payload = { sub: user.id, email: user.email, role: user.role, deviceId: null };
    const tokens = await this.generateTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  private async generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
    });

    // Lưu session vào DB
    await this.createSession(payload.sub, refreshToken, payload.deviceId);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
    };
  }
}
