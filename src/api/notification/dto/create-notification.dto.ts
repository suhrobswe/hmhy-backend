import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  lesson: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  message: string;

  @IsDateString()
  @IsNotEmpty()
  sendAt: string;

  @IsBoolean()
  @IsOptional()
  isSend?: boolean;
}
