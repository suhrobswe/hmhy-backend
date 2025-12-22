import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Teacher email address',
  })
  @IsEmail({}, { message: 'Email formati noto‘g‘ri' })
  @IsNotEmpty({ message: 'Email kiritilishi shart' })
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP code sent to email' })
  @IsString({ message: 'OTP faqat matn bo‘lishi kerak' })
  @Length(6, 6, { message: 'OTP 6 ta raqamdan iborat bo‘lishi kerak' })
  @IsNotEmpty({ message: 'OTP kiritilishi shart' })
  otp: string;
}
