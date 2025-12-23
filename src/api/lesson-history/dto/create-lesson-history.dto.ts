import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLessonHistoryDto {
  @ApiProperty({ description: 'Lesson ID' })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;
  @ApiProperty({ description: 'Teacher feedback', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  feedback?: string;

  @ApiProperty({
    description: 'Rating (1-5 stars)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ description: 'Homework description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  homework?: string;

  @ApiProperty({
    description: 'Lesson duration in minutes',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  lessonDuration?: number;
}
