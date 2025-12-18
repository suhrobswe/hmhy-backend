import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Teacher } from './teacher.entity';
import { BaseEntity } from './base.entity';

@Entity('lessonTemplate')
export class LessonTemplate extends BaseEntity {
  @Column({ type: 'uuid' })
  teacher: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.lessonTemplates)
  @JoinColumn({ name: 'teacher' })
  teacherRelation: Teacher;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', array: true })
  timeSlot: string[];
}
