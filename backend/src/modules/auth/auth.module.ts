import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <--- Thêm cái này
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UserEntity } from '../user/entities/user.entity'; // <--- Import UserEntity xịn

@Module({
  imports: [
    // Dùng UserEntity ở đây
    TypeOrmModule.forFeature([UserEntity]),

    // 2. Cấu hình "Máy in Token" (JWT)
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, 
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any }, 
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
