import { IsString, IsNotEmpty } from 'class-validator';

export class BlackListDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
