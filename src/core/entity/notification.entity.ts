import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Lesson } from './lesson.entity';
import {
  NotificationChannel,
  NotificationType,
} from 'src/common/enum/index.enum';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.notifications)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isCancelled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sendAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
