import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConversationDto {
  @ApiProperty({ example: 'Cuộc trò chuyện mới' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
