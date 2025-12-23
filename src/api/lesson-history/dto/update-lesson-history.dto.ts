import { PartialType } from '@nestjs/swagger';
import { CreateLessonHistoryDto } from './create-lesson-history.dto';

export class UpdateLessonHistoryDto extends PartialType(CreateLessonHistoryDto) {}