import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LessonStatus } from 'src/common/enum/index.enum';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  googleMeetUrl?: string;

  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @IsString()
  @IsOptional()
  googleEventId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
