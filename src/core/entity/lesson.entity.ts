import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';
import { LessonStatus } from 'src/common/enum/index.enum';
import { BaseEntity } from './base.entity';
import { Notification } from './notification.entity';

@Entity('lesson')
export class Lesson extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'uuid' })
  teacherId: string;

  @Column({ type: 'uuid', nullable: true })
  studentId: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.lessonHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.lessons)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'varchar', nullable: true })
  googleMeetUrl?: string;

  @Column({ type: 'enum', enum: LessonStatus, default: LessonStatus.AVAILABLE })
  status: LessonStatus;

  @Column({ type: 'varchar', nullable: true })
  googleEventId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'uuid', nullable: true })
  teacherPayment?: string;

  @Column({ type: 'timestamp', nullable: true })
  bookedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  remainedSendAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  notification?: string;

  @Column({ type: 'uuid', nullable: true })
  transaction?: string;

  @OneToMany(() => Notification, (notification) => notification.lesson)
  notifications?: Notification[];
}
