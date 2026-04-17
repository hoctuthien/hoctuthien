import { IsString, IsNotEmpty } from 'class-validator';

export class NotificationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
