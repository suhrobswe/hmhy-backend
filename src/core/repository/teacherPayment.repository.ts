import { Repository } from 'typeorm';
import { TeacherPayment } from '../entity/teacherPayment.entity';

export type TeacherPaymentRepository = Repository<TeacherPayment>;
