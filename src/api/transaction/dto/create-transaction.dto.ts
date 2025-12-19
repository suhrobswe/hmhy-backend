import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TransactionStatus } from 'src/common/enum/index.enum';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  lesson: string;

  @IsUUID()
  @IsNotEmpty()
  student: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
