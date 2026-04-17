import { IsString, IsNotEmpty } from 'class-validator';

export class ConversationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
