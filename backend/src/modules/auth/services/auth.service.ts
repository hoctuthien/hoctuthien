import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { UserEntity, UserRole } from '../../user/entities/user.entity';
import { UserSessionEntity } from '../../user-session/entities/user-session.entity';
import { IAuthService } from '../interfaces/auth.service.interface';
import { LoginDto, RegisterDto, ResetPasswordDto } from '../dtos/auth.dto';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { REDIS_CLIENT } from 'src/modules/redis/redis.module';
import Redis from 'ioredis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UserSessionService } from '../../user-session/services/user-session.service';
import { ConflictException } from '@nestjs/common';
import { MailService } from '../../mail/services/mail.service';
import { OtpPurpose, OtpTokenEntity } from '../entities/otp-token.entity';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserSessionEntity)
    private readonly sessionRepository: Repository<UserSessionEntity>,

    @InjectRepository(OtpTokenEntity)
    private readonly otpRepository: Repository<OtpTokenEntity>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userSessionService: UserSessionService,
    private readonly mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId') ||
        process.env.GOOGLE_CLIENT_ID,
    );
  }

  private requireDeviceId(deviceId?: string | null) {
    const normalized = typeof deviceId === 'string' ? deviceId.trim() : '';
    if (!normalized || normalized === 'unknown') {
      throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
    }

    return normalized;
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    deviceId?: string,
  ) {
    const expiresAt = this.calculateExpirationDate(
      process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    );

    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      deviceName: this.requireDeviceId(deviceId),
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
    const { email, password, name, phone, dayOfBirth, gender } = registerDto;
    const deviceId = this.requireDeviceId(requestInfo?.deviceId);

    const existingUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (existingUser) {
      if (existingUser.deletedAt) {
        // Tài khoản đã bị xóa (soft deleted), tiến hành xóa hoàn toàn để đăng ký mới
        await this.userRepository.delete(existingUser.id);
      } else {
        throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
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

    void this.mailService
      .sendRegistrationEmail({
        to: user.email,
        recipientName: user.name,
      })
      .catch((err) => {
        this.logger.error(
          `Failed to send registration email to ${user.email}: ${err?.message || err}`,
        );
      });

    const adminEmail = this.mailService.getAdminEmail();
    if (adminEmail && adminEmail !== user.email) {
      void this.mailService
        .sendRegistrationEmail({
          to: adminEmail,
          recipientName: `Ban quản trị (Đăng ký mới: ${user.name})`,
        })
        .catch((err) => {
          this.logger.error(
            `Failed to send registration email to admin ${adminEmail}: ${err?.message || err}`,
          );
        });
    }

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
    requestInfo?: { ip?: string; userAgent?: string; deviceId?: string },
  ) {
    const { email, password } = loginDto;
    const deviceId = this.requireDeviceId(requestInfo?.deviceId);

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

  async requestPasswordReset(
    email: string,
    requestInfo?: { ip?: string },
  ): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi.',
      };
    }

    const otp = this.generateOtpCode();
    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.consumeActiveOtps(normalizedEmail, OtpPurpose.PASSWORD_RESET);

    const codeHash = await bcrypt.hash(otp, 10);
    const otpToken = this.otpRepository.create({
      email: normalizedEmail,
      userId: user.id,
      purpose: OtpPurpose.PASSWORD_RESET,
      codeHash,
      expiresAt,
      consumedAt: null,
      attempts: 0,
      metadata: {
        ip: requestInfo?.ip || null,
      },
    });
    await this.otpRepository.save(otpToken);

    await this.mailService.sendPasswordResetOtpEmail({
      to: user.email,
      recipientName: user.name,
      otp,
      expiresInMinutes,
    });

    return {
      message:
        'Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi.',
    };
  }

  async resetPasswordWithOtp(
    payload: ResetPasswordDto,
    requestInfo?: { ip?: string },
  ): Promise<{ message: string }> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const otp = payload.otp.trim();

    const otpToken = await this.otpRepository.findOne({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.PASSWORD_RESET,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpToken) {
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn.');
    }

    if (otpToken.attempts >= 5) {
      otpToken.consumedAt = new Date();
      await this.otpRepository.save(otpToken);
      throw new BadRequestException('OTP đã vượt quá số lần thử cho phép.');
    }

    const isMatch = await bcrypt.compare(otp, otpToken.codeHash);
    if (!isMatch) {
      otpToken.attempts += 1;
      otpToken.metadata = {
        ...(otpToken.metadata || {}),
        lastFailedIp: requestInfo?.ip || null,
      };
      await this.otpRepository.save(otpToken);
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn.');
    }

    const user = await this.userRepository.findOne({
      where: { id: otpToken.userId || undefined, email: normalizedEmail },
    });
    if (!user) {
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn.');
    }

    user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await this.userRepository.save(user);

    otpToken.consumedAt = new Date();
    otpToken.metadata = {
      ...(otpToken.metadata || {}),
      resetIp: requestInfo?.ip || null,
    };
    await this.otpRepository.save(otpToken);

    return { message: 'Đặt lại mật khẩu thành công.' };
  }

  async refreshTokens(refreshToken: string, deviceId: string) {
    try {
      const requestDevice = this.requireDeviceId(deviceId);
      console.log('[refreshTokens Debug] Input deviceId:', requestDevice);
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });
      console.log('[refreshTokens Debug] Decoded payload:', payload);

      // Find session including soft-deleted ones to prevent race conditions during concurrent NextAuth updates
      const session = await this.sessionRepository.findOne({
        where: { refreshToken },
        withDeleted: true,
      });
      console.log(
        '[refreshTokens Debug] Matched session in DB (withDeleted):',
        session,
      );

      if (!session) {
        console.warn('[refreshTokens Debug] Session not found for token');
        throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
      }

      // Check if session is soft-deleted (which means it was rotated)
      if (session.deletedAt) {
        // Adjust for timezone offset parsing shift since deletedAt column in BaseEntity
        // doesn't have timezone specification (defaults to timestamp without time zone)
        const timezoneOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
        const deletedTime =
          new Date(session.deletedAt).getTime() - timezoneOffsetMs;
        const now = Date.now();
        const gracePeriodMs = 30 * 1000; // 30 seconds grace period
        if (now - deletedTime > gracePeriodMs) {
          console.warn(
            '[refreshTokens Debug] Revoked token reuse detected outside grace period.',
          );
          throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
        }
        console.log(
          '[refreshTokens Debug] Revoked token used within grace period.',
        );
      } else {
        if (session.status !== 'active') {
          console.warn(
            '[refreshTokens Debug] Session status is not active:',
            session.status,
          );
          throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
        }
      }

      const tokenDevice = this.requireDeviceId(payload.deviceId);
      const sessionDevice = this.requireDeviceId(session.deviceName);
      console.log(
        '[refreshTokens Debug] sessionDevice:',
        sessionDevice,
        '| tokenDevice:',
        tokenDevice,
        '| requestDevice:',
        requestDevice,
      );

      if (sessionDevice !== requestDevice || tokenDevice !== requestDevice) {
        console.warn(
          '[refreshTokens Debug] Device verification failed. sessionDevice:',
          sessionDevice,
          'tokenDevice:',
          tokenDevice,
          'requestDevice:',
          requestDevice,
        );
        throw new UnauthorizedException(AUTH_MESSAGES.DEVICE_INVALID);
      }

      // Rotation: Revoke old session (only if it wasn't already deleted)
      if (!session.deletedAt) {
        await this.userSessionService.remove(session.id);
      }

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
        deviceId: requestDevice,
      };
      const tokens = await this.generateTokens(newPayload);

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

  private generateOtpCode(): string {
    return randomInt(0, 1000000).toString().padStart(6, '0');
  }

  private async consumeActiveOtps(email: string, purpose: OtpPurpose) {
    await this.otpRepository
      .createQueryBuilder()
      .update(OtpTokenEntity)
      .set({ consumedAt: new Date() })
      .where('email = :email', { email })
      .andWhere('purpose = :purpose', { purpose })
      .andWhere('consumed_at IS NULL')
      .execute();
  }

  async validateGoogleUser(googleUser: any, deviceId?: string) {
    const { googleId, email, name, avatarUrl } = googleUser;
    const currentDeviceId = this.requireDeviceId(deviceId);

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
      deviceId: currentDeviceId,
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
