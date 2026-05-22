import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'a@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'a@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '123456', minLength: 6, required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(255)
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  googleId?: string;

  @ApiProperty({ example: '0987654321', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({ example: '2000-01-01', required: false })
  @IsString()
  @IsOptional()
  dayOfBirth?: string;

  @ApiProperty({ example: 'male', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  gender?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.MENTEE })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 'active', default: 'active' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  points?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  preferences?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;

  @ApiProperty({ example: 'UTC', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}
