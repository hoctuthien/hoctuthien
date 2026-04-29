import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from '../../user/entities/user.entity';
import { UserSessionEntity } from '../../user-session/entities/user-session.entity';
import { IAuthService } from '../interfaces/auth.service.interface';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { REDIS_CLIENT } from 'src/modules/redis/redis.module';
import Redis from 'ioredis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UserSessionService } from '../../user-session/services/user-session.service';
import { ConflictException } from '@nestjs/common';

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
    private readonly userSessionService: UserSessionService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId') ||
        process.env.GOOGLE_CLIENT_ID,
    );
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    deviceId?: string,
  ) {
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

  async verifyGoogleToken(idToken: string, deviceId?: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience:
          this.configService.get<string>('google.clientId') ||
          process.env.GOOGLE_CLIENT_ID,
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

      return this.validateGoogleUser(googleUser, deviceId);
    } catch (error) {
      throw new UnauthorizedException(
        'Xác thực Google thất bại: ' + error.message,
      );
    }
  }

  async testRedis() {
    await this.redis.set('my_key', 'hello_redis', 'EX', 10);
    const value = await this.redis.get('my_key');
    console.log('Giá trị lấy từ Redis là:', value);
    return value;
  }

  async register(
    registerDto: RegisterDto,
    requestInfo?: { ip?: string; deviceId?: string },
  ) {
    const { email, password, name, deviceId, phone, dayOfBirth, gender } =
      registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      email,
      passwordHash,
      name,
      phone,
      dayOfBirth: dayOfBirth ? new Date(dayOfBirth) : null,
      gender,
      role: UserRole.MENTEE,
      status: 'active',
      isVerified: false,
    });
    const user = await this.userRepository.save(newUser);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    };
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

  async login(
    loginDto: LoginDto,
    requestInfo?: { ip?: string; userAgent?: string },
  ) {
    const { email, password, deviceId } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    };
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

  async refreshTokens(refreshToken: string, deviceId: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });

      const session = await this.userSessionService.findOneBy({
        refreshToken,
        deviceName: deviceId,
        status: 'active',
      });

      if (!session) {
        throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
      }

      // Rotation: Revoke old session
      await this.userSessionService.remove(session.id);

      // Generate new tokens
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user)
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        deviceId,
      };
      const tokens = await this.generateTokens(newPayload);

      // Create new session
      const expiresAt = this.calculateExpirationDate(
        process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      );
      await this.userSessionService.create({
        userId: user.id,
        refreshToken: tokens.refresh_token,
        refreshTokenExpiresAt: expiresAt,
        deviceName: deviceId,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      // Trả về lỗi chi tiết hơn thay vì mask mọi thứ vào DEVICE_INVALID
      throw new UnauthorizedException(
        error.message || AUTH_MESSAGES.DEVICE_INVALID,
      );
    }
  }

  async logout(accessToken: string, refreshToken: string, deviceId: string) {
    // 1. Blacklist Access Token vào Redis
    try {
      const payload = this.jwtService.decode(accessToken);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = payload.exp - now; // Thời gian còn lại tính bằng giây

        if (ttl > 0) {
          await this.redis.set(`blacklist:${accessToken}`, '1', 'EX', ttl);
        }
      }
    } catch (error) {
      console.error('Lỗi khi blacklist token:', error);
    }

    // 2. Thu hồi Refresh Token trong DB
    const session = await this.userSessionService.findOneBy({
      refreshToken,
      deviceName: deviceId,
    });

    if (session) {
      await this.userSessionService.remove(session.id);
    }
  }

  private calculateExpirationDate(expiresIn: string): Date {
    const value = parseInt(expiresIn);
    const unit = expiresIn.slice(-1);
    const now = new Date();

    switch (unit) {
      case 'd':
        now.setDate(now.getDate() + value);
        break;
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() + value);
        break;
      case 's':
        now.setSeconds(now.getSeconds() + value);
        break;
      default:
        // Default to 7 days if unknown format
        now.setDate(now.getDate() + 7);
    }
    return now;
  }

  async validateGoogleUser(googleUser: any, deviceId?: string) {
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

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    };
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
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
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
