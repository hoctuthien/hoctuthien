import { IsString, IsNotEmpty } from 'class-validator';

export class CourseReviewDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
