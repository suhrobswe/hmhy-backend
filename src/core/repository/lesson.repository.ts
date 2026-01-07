import { Repository } from 'typeorm';
import { Lesson } from '../entity/lesson.entity';

export type LessonRepository = Repository<Lesson>;
