import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CourseBookingDto {
  @ApiProperty({ example: 'Đặt chỗ khóa học A' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
