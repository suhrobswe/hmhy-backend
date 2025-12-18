import { Roles } from 'src/common/enum/index.enum';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Lesson } from './lesson.entity';
import { Transaction } from './transaction.entity';
import { LessonHistory } from './lessonHistory.entity';

@Entity('student')
export class Student extends BaseEntity {
  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.STUDENT })
  role: Roles;

  @Column({ type: 'varchar', unique: true, nullable: true })
  tgId: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  tgUsername: string;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  blockedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  blockedReason: string;

  @Column({ type: 'uuid', nullable: true })
  lesson: string;

  @Column({ type: 'uuid', nullable: true })
  lessonHistory: string;

  @Column({ type: 'uuid', nullable: true })
  notification: string;

  @OneToMany(() => Lesson, (lesson) => lesson.student)
  lessons: Lesson[];

  @OneToMany(() => Transaction, (transaction) => transaction.student)
  transactions: Transaction[];

  @OneToMany(() => LessonHistory, (history) => history.student)
  history: LessonHistory[];
}
