import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MentorAvailabilityEmptyActionDto {}

export class MentorAvailabilityReviewDto {
  @ApiProperty({ example: 'Đồng ý với yêu cầu này' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
