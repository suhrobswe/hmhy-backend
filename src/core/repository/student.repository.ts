import { Repository } from 'typeorm';
import { Student } from '../entity/student.entity';

export type StudentRepository = Repository<Student>;
