import { IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'CurrentP@ssw0rd123',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password the user wants to set',
    example: 'NewStr0ngP@ss!',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  newPassword: string;
}
