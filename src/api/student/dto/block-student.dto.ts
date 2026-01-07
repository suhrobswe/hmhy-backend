import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BlockStudentDto {
  @IsBoolean()
  @IsNotEmpty()
  isBlocked: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  blockedReason?: string;
}
