import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeacherPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  teacher: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  lessons: string[];

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  totalLessonAmount: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  platformComission: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  platformAmount: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  teacherAmount: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
