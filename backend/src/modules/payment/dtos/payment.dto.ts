import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
