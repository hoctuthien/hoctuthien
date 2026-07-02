import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserEntity } from '../user/entities/user.entity';
import { UserSessionEntity } from '../user-session/entities/user-session.entity';
import { OtpTokenEntity } from './entities/otp-token.entity';
import { RedisModule } from '../redis/redis.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { UserSessionModule } from '../user-session/user-session.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserSessionEntity, OtpTokenEntity]),
    RedisModule,
    PassportModule,
    UserSessionModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<any>('jwt.accessExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
