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
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { REDIS_CLIENT } from 'src/modules/redis/redis.module';
import Redis from 'ioredis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UserSessionService } from '../../user-session/services/user-session.service';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userSessionService: UserSessionService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId') || process.env.GOOGLE_CLIENT_ID,
    );
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

  async register(registerDto: RegisterDto, requestInfo?: { ip?: string; deviceId?: string }) {
    const { email, password, name, deviceId } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      email,
      passwordHash,
      name,
      role: UserRole.MENTEE,
      status: 'active',
      isVerified: false,
    });
    const user = await this.userRepository.save(newUser);

    const payload = { sub: user.id, email: user.email, role: user.role, deviceId };
    const tokens = await this.generateTokens(payload);

    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresAt = this.calculateExpirationDate(refreshTokenExpiresIn);

    await this.userSessionService.create({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      refreshTokenExpiresAt: expiresAt,
      ipAddress: requestInfo?.ip,
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
  }

  async login(loginDto: LoginDto, requestInfo?: { ip?: string; userAgent?: string }) {
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
    const tokens = await this.generateTokens(payload);

    // Create a new session in the database
    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresAt = this.calculateExpirationDate(refreshTokenExpiresIn);

    await this.userSessionService.create({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      refreshTokenExpiresAt: expiresAt,
      ipAddress: requestInfo?.ip,
      userAgent: requestInfo?.userAgent,
      deviceName: deviceId, // Use deviceId as deviceName for now if available
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
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);

      const newPayload = { sub: user.id, email: user.email, role: user.role, deviceId };
      const tokens = await this.generateTokens(newPayload);

      // Create new session
      const expiresAt = this.calculateExpirationDate(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
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
      throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
    }
  }

  async logout(refreshToken: string, deviceId: string) {
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

    const payload = { sub: user.id, email: user.email, role: user.role };
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
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
    };
  }
}
