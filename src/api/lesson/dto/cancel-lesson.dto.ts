import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LessonStatus } from 'src/common/enum/index.enum';

export class CancelLessonDto {
  @IsEnum(LessonStatus)
  @IsNotEmpty()
  status: LessonStatus.CANCELED;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
