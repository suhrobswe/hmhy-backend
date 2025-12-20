import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SoftDeleteDto {
  @ApiProperty({
    example: 'Bu ustoz masuliyatsiz ekan',
  })
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  reason: string;
}
