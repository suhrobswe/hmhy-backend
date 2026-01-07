import { Repository } from 'typeorm';
import { LessonHistory } from '../entity/lessonHistory.entity';

export type LessonHistoryRepository = Repository<LessonHistory>;
