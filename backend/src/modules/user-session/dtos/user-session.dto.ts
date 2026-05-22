import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UserSessionDto {
  @ApiProperty({ example: 'Session 1' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
