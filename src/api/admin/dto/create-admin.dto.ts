import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Roles } from 'src/common/enum/index.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({ example: 'suhrob', description: 'Admin username' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @ApiProperty({ example: 'suhrob1234', description: 'Admin password' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(13)
  @MaxLength(15)
  @ApiProperty({ example: '+998901234567', description: 'Admin phone number' })
  phoneNumber: string;

  @IsEnum(Roles)
  @IsOptional()
  role?: Roles;
}
