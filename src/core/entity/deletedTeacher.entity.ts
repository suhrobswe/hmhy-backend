import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Teacher } from './teacher.entity';

@Entity('deletedTeacher')
export class DeletedTeacher extends BaseEntity {
  @Column({ type: 'uuid' })
  teacher: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.deletedRecords)
  @JoinColumn({ name: 'teacher' })
  teacherRelation: Teacher;

  @Column({ type: 'uuid' })
  deletedBy: string;

  @Column({ type: 'varchar', nullable: true })
  reason: string;

  @Column({ type: 'timestamp' })
  deletedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  restoreAt: Date;
}
