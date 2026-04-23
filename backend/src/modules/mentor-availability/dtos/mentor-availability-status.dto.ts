import { IsNotEmpty, IsString } from 'class-validator';

export class MentorAvailabilityEmptyActionDto {}

export class MentorAvailabilityReviewDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}
