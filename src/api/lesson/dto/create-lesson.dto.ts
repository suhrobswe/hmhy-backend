import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LessonStatus } from 'src/common/enum/index.enum';

export class CreateLessonDto {
  @ApiProperty({
    example: 'Matematika 101',
    description: 'Darsning nomi',
    minLength: 2,
    maxLength: 200,
  })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: '2025-12-31T10:00:00Z',
    description: 'Dars boshlanish vaqti ISO string formatda',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    example: '2025-12-31T11:00:00Z',
    description: 'Dars tugash vaqti ISO string formatda',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    example: 50000,
    description: "Dars narxi (so'mda)",
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    enum: LessonStatus,
    description: 'Dars holati',
    default: LessonStatus.AVAILABLE,
  })
  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @ApiPropertyOptional({
    example: false,
    description: 'Dars to`langan yoki yo`qligi',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
