import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CourseReviewDto {
  @ApiProperty({ example: 'Đánh giá khóa học' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
