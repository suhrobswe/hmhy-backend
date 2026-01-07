import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherSignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'suhrobabdurazzok@gmail.com',
    description: 'Teacher email',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Suhrob123!', description: 'Teacher password' })
  password: string;
}
