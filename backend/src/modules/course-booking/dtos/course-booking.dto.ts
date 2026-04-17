import { IsString, IsNotEmpty } from 'class-validator';

export class CourseBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
