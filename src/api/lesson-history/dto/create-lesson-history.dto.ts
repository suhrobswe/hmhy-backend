import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Rating } from 'src/common/enum/index.enum';

export class CreateLessonHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsEnum(Rating)
  @IsNotEmpty()
  star: Rating;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  feedback?: string;

  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}
