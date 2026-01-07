import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterDto {
  @ApiPropertyOptional({
    type: String,
    example: 'BEGINNER',
    description: "O'qituvchi darajasi (level)",
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Mathematics',
    description: "O'qituvchi mutaxassisligi",
  })
  @IsString()
  @IsOptional()
  specification?: string;
}
