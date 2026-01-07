import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Teacher } from './teacher.entity';

@Entity('teacherPayment')
export class TeacherPayment extends BaseEntity {
  @Column({ type: 'uuid' })
  teacher: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.payments)
  @JoinColumn({ name: 'teacher' })
  teacherRelation: Teacher;

  @Column({ type: 'uuid', array: true })
  lessons: string[];

  @Column({ type: 'int' })
  totalLessonAmount: number;

  @Column({ type: 'int' })
  platformComission: number;

  @Column({ type: 'int' })
  platformAmount: number;

  @Column({ type: 'int' })
  teacherAmount: number;

  @Column({ type: 'uuid', nullable: true })
  paidBy: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'boolean', default: false })
  isCanceled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @Column({ type: 'uuid', nullable: true })
  canceledBy: string;

  @Column({ type: 'varchar', nullable: true })
  canceledReason: string;

  @Column({ type: 'varchar', nullable: true })
  notes: string;
}
