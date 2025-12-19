import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '113772', description: '6 talik OTP kod' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "OTP 6 ta raqam bo'lishi kerak" })
  otp: string;

  @ApiProperty({ example: '+998901234568', description: 'Telefon raqam' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phoneNumber: string;
}
