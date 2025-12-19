import { IsNotEmpty, IsUUID } from 'class-validator';

export class PayTeacherDto {
  @IsUUID()
  @IsNotEmpty()
  paidBy: string;
}
