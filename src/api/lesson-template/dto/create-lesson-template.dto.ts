import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLessonTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  teacher: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  timeSlot: string[];
}
