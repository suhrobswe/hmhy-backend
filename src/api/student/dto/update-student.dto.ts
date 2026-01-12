import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Telefon raqami noto‘g‘ri formatda',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email manzili noto‘g‘ri formatda' })
  email?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
