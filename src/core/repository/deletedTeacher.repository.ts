import { Repository } from 'typeorm';
import { DeletedTeacher } from '../entity/deletedTeacher.entity';

export type DeltedTeacherRepository = Repository<DeletedTeacher>;
