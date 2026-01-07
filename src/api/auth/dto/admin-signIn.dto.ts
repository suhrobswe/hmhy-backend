import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminSignInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'suhrob', description: 'Admin username' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'suhrob', description: 'Admin password' })
  password: string;
}
