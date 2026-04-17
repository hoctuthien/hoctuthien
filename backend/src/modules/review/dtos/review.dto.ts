import { IsString, IsNotEmpty } from 'class-validator';

export class ReviewDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
