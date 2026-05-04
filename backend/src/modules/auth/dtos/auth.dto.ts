import { MESSAGES } from '@nestjs/core/constants';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { v4 as uuidv4 } from 'uuid';

export class LoginDto {
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_EMAIL })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_PASSWORD })
  @MinLength(6, { message: AUTH_MESSAGES.INVALID_PASSWORD })
  password!: string;


}

export class GoogleTokenDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  token: string; // idToken từ Frontend
}
export class RegisterDto {
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_EMAIL })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.EMPTY_PASSWORD })
  @MinLength(6, { message: AUTH_MESSAGES.INVALID_PASSWORD })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  dayOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;


}
