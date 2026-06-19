import { IsString, IsNotEmpty } from 'class-validator';

export class BugReportDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
