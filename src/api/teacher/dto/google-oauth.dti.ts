import {
  IsBoolean,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeacherSpecification } from 'src/common/enum/index.enum';

export class CompleteGoogleRegistrationDto {
  @ApiProperty({
    description: 'Phone number in international format',
    example: '+998901234567',
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid international format',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Password for account',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({
    description: 'Card number (16 digits)',
    example: '1234567890123456',
    pattern: '^\\d{16}$',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'Teacher specification',
    enum: TeacherSpecification,
    example: TeacherSpecification.ENGLISH,
  })
  @IsEnum(TeacherSpecification)
  @IsOptional()
  specification?: TeacherSpecification;

  @ApiPropertyOptional({
    description: 'Teacher level',
    example: 'B2',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    description: 'Teacher description',
    example: 'Experienced English teacher with 5 years of experience',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Hourly price in currency',
    example: 50000,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  hourPrice?: number;

  @ApiPropertyOptional({
    description: 'Portfolio link URL',
    example: 'https://portfolio.example.com',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  portfolioLink?: string;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: '5 years',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  experience?: string;
}
