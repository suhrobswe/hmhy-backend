import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Rating } from 'src/common/enum/index.enum';
import { Student } from './student.entity';

@Entity('lessonHistory')
export class LessonHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  lessonId: string;

  @Column({ type: 'enum', enum: Rating })
  star: Rating;

  @Column({ type: 'varchar', nullable: true })
  feedback: string;

  @Column({ type: 'uuid' })
  teacherId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, (student) => student.history)
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
