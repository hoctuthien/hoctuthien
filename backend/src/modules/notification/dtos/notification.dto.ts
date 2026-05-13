import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class NotificationDto {
  @ApiProperty({ example: 'Thông báo mới' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
