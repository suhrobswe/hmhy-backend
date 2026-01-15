import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TeacherSpecification } from 'src/common/enum/index.enum';

export class UpdateTeacherDto {
  @ApiPropertyOptional({ example: '+998901234567' })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be valid' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: '1234567812345678' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber?: string;

  @ApiPropertyOptional({ enum: TeacherSpecification })
  @IsEnum(TeacherSpecification, {
    message: 'Specification must be one of: ENGLISH, RUSSIAN, DEUTSCH, etc.',
  })
  @IsOptional()
  specification?: TeacherSpecification;

  @ApiPropertyOptional({ example: 'Senior' })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @IsOptional()
  @Min(0)
  hourPrice?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  portfolioLink?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  experience?: string;
}
