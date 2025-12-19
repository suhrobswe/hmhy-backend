import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonHistoryDto } from './create-lesson-history.dto';

export class UpdateLessonHistoryDto extends PartialType(CreateLessonHistoryDto) {}
