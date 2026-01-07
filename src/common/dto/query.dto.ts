import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SearchFieldEnum } from '../enum/index.enum';

export class QueryDto {
  @ApiPropertyOptional({
    type: String,
    example: 'John',
    description: "Qidiruv so'zi",
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
}
