import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Lesson } from './lesson.entity';

@Entity('notification')
export class Notification extends BaseEntity {
  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  lesson: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.notifications)
  @JoinColumn({ name: 'lesson' })
  lessonRelation: Lesson;

  @Column({ type: 'varchar' })
  message: string;

  @Column({ type: 'timestamp' })
  sendAt: Date;

  @Column({ type: 'boolean', default: false })
  isSend: boolean;
}
