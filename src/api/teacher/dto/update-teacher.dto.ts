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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeacherSpecification } from 'src/common/enum/index.enum';

export class UpdateTeacherDto {
  @ApiPropertyOptional({
    description: 'Teacher phone number in international format',
    example: '+998901234567',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid international format',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Full name of the teacher',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({
    description: 'Card number (16 digits)',
    example: '1234567812345678',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'Teacher specification / subject',
    enum: TeacherSpecification,
    example: TeacherSpecification.DEUTSCH,
  })
  @IsEnum(TeacherSpecification)
  @IsOptional()
  specification?: TeacherSpecification;

  @ApiPropertyOptional({
    description: 'Teacher level or rank',
    example: 'Senior',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    description: 'Description about the teacher',
    example: 'Experienced math teacher with 10 years of practice',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Hourly price in USD',
    example: 50,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  hourPrice?: number;

  @ApiPropertyOptional({
    description: 'Portfolio link or website',
    example: 'https://github.com/suhrobswe',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  portfolioLink?: string;

  @ApiPropertyOptional({
    description: 'Experience description',
    example: '10 years teaching experience in high school',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  experience?: string;
}
