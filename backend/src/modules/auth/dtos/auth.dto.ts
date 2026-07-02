import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  Length,
} from 'class-validator';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email của người dùng',
  })
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_EMAIL })
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Mật khẩu người dùng',
  })
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_PASSWORD })
  @MinLength(6, { message: AUTH_MESSAGES.INVALID_PASSWORD })
  password!: string;
}

export class GoogleTokenDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'idToken từ Google SDK ở Frontend' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_EMAIL })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_PASSWORD })
  @MinLength(6, { message: AUTH_MESSAGES.INVALID_PASSWORD })
  password!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name!: string;

  @ApiProperty({ example: '0987654321', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '2000-01-01',
    required: false,
    description: 'Ngày sinh (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  dayOfBirth?: string;

  @ApiProperty({
    example: 'male',
    required: false,
    enum: ['male', 'female', 'other'],
  })
  @IsString()
  @IsOptional()
  gender?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_EMAIL })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_EMAIL })
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6, { message: 'OTP phải gồm 6 chữ số' })
  otp!: string;

  @ApiProperty({ example: 'newPassword123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_PASSWORD })
  @MinLength(6, { message: AUTH_MESSAGES.INVALID_PASSWORD })
  newPassword!: string;
}
