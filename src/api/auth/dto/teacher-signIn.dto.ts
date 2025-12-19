import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherSignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'suhrob@example.com', description: 'Teacher email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'suhrob', description: 'Teacher password' })
  password: string;
}
