import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';
import { CourseStatus } from '../enums/course-status.enum';

export class CourseDto {
  @ApiProperty({ example: 'Khóa học lập trình NestJS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Học NestJS từ cơ bản đến nâng cao',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 120, default: 60 })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ example: ['Basic Javascript'], required: false })
  @IsArray()
  @IsOptional()
  prerequisites?: string[];

  @ApiProperty({
    example: {
      time: {
        monday: ['09:00-11:00', '14:00-16:00'],
        wednesday: ['19:00-21:00'],
      },
    },
    required: false,
  })
  @IsOptional()
  metadata?: any;

  @ApiProperty({ enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({ example: ['123', '456'], required: false })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];
}

export class CreateCourseDto extends CourseDto {}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  approvedBy?: string;
}
