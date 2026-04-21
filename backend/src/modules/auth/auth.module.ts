// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UserEntity } from '../user/entities/user.entity';
import { AuthEntity } from './entities/auth.entity';
import { AuthRepository } from './repositories/auth.repository';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity, UserEntity]),
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // Lấy secret key, nếu không có thì để trống (ép kiểu về string để hết lỗi)
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          // Ép kiểu 'as any' ở đây là cách nhanh nhất để TypeScript
          // chấp nhận chuỗi '1h' hay '15m' từ file .env
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
