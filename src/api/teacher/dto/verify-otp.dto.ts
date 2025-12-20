import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTelegramOtpDto {
  @ApiProperty({
    example: 'c7f1a5e3-4d2b-4a1a-9e9f-2c3f7d1b9a01',
    description: 'Telegram /start orqali olingan token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: '113772',
    description: 'Telegram bot yuborgan 6 xonali OTP',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "OTP 6 ta raqam bo'lishi kerak" })
  otp: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Telegram orqali tasdiqlangan telefon raqam',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: "Telefon raqam noto'g'ri formatda",
  })
  phoneNumber: string;
}
