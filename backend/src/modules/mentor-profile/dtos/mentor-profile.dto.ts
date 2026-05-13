import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { MentorProfileStatus } from '../enums/mentor-profile-status.enum';

export class MentorProfileDto {
  @ApiProperty({ example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Senior Software Engineer', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ example: 'Google', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({
    example: 'Experienced mentor in NestJS and TypeORM',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'https://linkedin.com/in/username', required: false })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  yearsOfExperience?: number;

  @ApiProperty({
    example: ['NestJS', 'TypeScript', 'PostgreSQL'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({
    example: { website: 'https://example.com' },
    required: false,
  })
  @IsOptional()
  metadata?: any;

  @ApiProperty({
    enum: MentorProfileStatus,
    default: MentorProfileStatus.PENDING,
  })
  @IsEnum(MentorProfileStatus)
  @IsOptional()
  status?: MentorProfileStatus;
}

export class CreateMentorProfileDto extends MentorProfileDto {}

export class UpdateMentorProfileDto extends PartialType(
  CreateMentorProfileDto,
) {
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  isApproved?: boolean;

  @ApiProperty({
    example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  approvedBy?: string;
}
