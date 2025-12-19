import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CancelTeacherPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  canceledBy: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  canceledReason: string;
}
