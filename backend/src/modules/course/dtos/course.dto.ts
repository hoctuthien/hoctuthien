import { IsString, IsNotEmpty } from 'class-validator';

export class CourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
