import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsUUID, 
  IsObject 
} from 'class-validator';
import { PostStatus } from '../enums/post-status.enum';

export class CreatePostDto {
  @ApiProperty({ description: 'Tiêu đề của bài viết' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Nội dung bài viết (JSON từ BlockNote)' })
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({ description: 'Tóm tắt ngắn gọn của bài viết' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ 
    description: 'Trạng thái bài viết', 
    enum: PostStatus, 
    default: PostStatus.DRAFT 
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'ID của Category' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu metadata (thumbnail, SEO tags, v.v)' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
