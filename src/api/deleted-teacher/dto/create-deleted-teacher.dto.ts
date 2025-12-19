import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDeletedTeacherDto {
  @IsUUID()
  @IsNotEmpty()
  teacher: string;

  @IsUUID()
  @IsNotEmpty()
  deletedBy: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
