import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FindAllPostsDto {
  @ApiPropertyOptional({ description: 'Filter by Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by Category Slug' })
  @IsString()
  @IsOptional()
  categorySlug?: string;

  @ApiPropertyOptional({ description: 'Filter by Tag ID' })
  @IsUUID()
  @IsOptional()
  tagId?: string;

  @ApiPropertyOptional({ description: 'Filter by Tag Slug' })
  @IsString()
  @IsOptional()
  tagSlug?: string;

  @ApiPropertyOptional({ description: 'Search term for post title' })
  @IsString()
  @IsOptional()
  search?: string;
}
