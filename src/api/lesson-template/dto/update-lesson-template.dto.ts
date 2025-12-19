import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonTemplateDto } from './create-lesson-template.dto';

export class UpdateLessonTemplateDto extends PartialType(CreateLessonTemplateDto) {}
