import {
  IsBoolean,
  IsEmail,
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
import { TeacherSpecification } from 'src/common/enum/index.enum';

export class CreateTeacherDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid international format',
  })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(TeacherSpecification)
  @IsOptional()
  specification?: TeacherSpecification;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  hourPrice?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  portfolioLink?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  experience?: string;
}
