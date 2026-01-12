import { IsOptional, IsIn, IsNumberString } from 'class-validator';

export class LessonFiltersDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsIn(['startTime', 'price', 'createdAt'])
  sortBy?: 'startTime' | 'price' | 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsIn(['AVAILABLE', 'BOOKED', 'COMPLETED', 'CANCELLED', ''])
  status?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
