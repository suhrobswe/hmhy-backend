import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
