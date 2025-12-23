import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Rating, LessonStatus } from 'src/common/enum/index.enum';

export class LessonComplete {
  @ApiProperty({
    description: 'Lesson status',
    example: LessonStatus.COMPLETED,
    enum: LessonStatus,
  })
  @IsEnum(LessonStatus)
  @Transform(({ value }) => value?.toString().toUpperCase()) // String'ga aylantirish
  status: LessonStatus;

  @ApiPropertyOptional({
    description: 'Rating for the lesson',
    example: Rating.FIVE,
    enum: Rating,
    default: Rating.FIVE,
  })
  @IsOptional()
  @IsEnum(Rating)
  @Transform(({ value }) => value?.toString().toUpperCase()) // String'ga aylantirish
  star?: Rating;

  @ApiPropertyOptional({
    description: 'Feedback for the lesson',
    example: 'Great lesson, student showed excellent progress',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
