import { MESSAGES } from '@nestjs/core/constants';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
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

  @IsString()
  @IsOptional() // Để là Optional để Server có thể tự điền nếu Client gửi thiếu
  deviceId?: string;
}

export class GoogleTokenDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  token: string; // idToken từ Frontend
}
