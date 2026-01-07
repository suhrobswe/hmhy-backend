import { Repository } from 'typeorm';
import { Teacher } from '../entity/teacher.entity';

export type TeacherRepository = Repository<Teacher>;
