import { IsString, IsNotEmpty } from 'class-validator';

export class UserSessionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
