import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MentorAvailabilityStatus } from '../../../common/enums/mentor-availability-status.enum';

export class CertificateDto {
  @ApiProperty({ example: 'IELTS 8.0' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'British Council' })
  @IsString()
  @IsOptional()
  issuedBy?: string;

  @ApiProperty({ example: 'https://example.com/cert.jpg' })
  @IsString()
  imageUrl: string;
}

export class DegreeDto {
  @ApiProperty({ example: 'Bachelor of Computer Science' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'University of Oxford' })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiProperty({ example: 'https://example.com/degree.jpg' })
  @IsString()
  imageUrl: string;
}

export class MentorAvailabilityMetadataDto {
  @ApiProperty({ type: [CertificateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[];

  @ApiProperty({ type: [DegreeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DegreeDto)
  degrees: DegreeDto[];
}

export class CreateMentorAvailabilityDto {
  @ApiPropertyOptional({ example: 'Senior Software Engineer' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Tech Solutions Inc.' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'I have 10 years of experience...' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: ['TypeScript', 'NestJS'] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ type: MentorAvailabilityMetadataDto })
  @ValidateNested()
  @Type(() => MentorAvailabilityMetadataDto)
  metadata: MentorAvailabilityMetadataDto;

  @ApiPropertyOptional({ example: 'Please review my application' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateMentorAvailabilityDto extends PartialType(CreateMentorAvailabilityDto) {
  @ApiPropertyOptional({ enum: MentorAvailabilityStatus })
  @IsEnum(MentorAvailabilityStatus)
  @IsOptional()
  status?: MentorAvailabilityStatus;

  @ApiPropertyOptional({ example: 'admin-uuid' })
  @IsString()
  @IsOptional()
  approvedBy?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
