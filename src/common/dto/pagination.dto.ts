import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchFieldEnum } from '../enum/index.enum';

export class PaginationDto {
  @ApiPropertyOptional({
    type: String,
    example: 'John',
    description: "Qidiruv so'zi (search query)",
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'fullName',
    description: 'Qaysi fieldda qidirish kerak',
    enum: SearchFieldEnum,
  })
  @IsEnum(SearchFieldEnum, {
    message:
      "search maydoni fullName, email, specification yoki description bo'lishi kerak",
  })
  @IsOptional()
  search?: SearchFieldEnum;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Sahifa raqami (1 dan boshlanadi)',
    default: 1,
  })
  @IsNumber({}, { message: "page raqam bo'lishi kerak" })
  @Type(() => Number)
  @Min(1, { message: "page kamida 1 bo'lishi kerak" })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    description: 'Har bir sahifada nechta element',
    default: 10,
  })
  @IsNumber({}, { message: "limit raqam bo'lishi kerak" })
  @Type(() => Number)
  @Min(1, { message: "limit kamida 1 bo'lishi kerak" })
  @IsOptional()
  limit?: number = 10;
}
