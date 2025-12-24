import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  AuthProvider,
  Roles,
  TeacherSpecification,
} from 'src/common/enum/index.enum';
import { LessonTemplate } from './lessonTemplate.entity';
import { TeacherPayment } from './teacherPayment.entity';
import { Lesson } from './lesson.entity';

@Entity('teacher')
export class Teacher extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  deletedBy: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  cardNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'boolean', default: false })
  isComplete: boolean;

  @Column({ type: 'enum', enum: Roles, default: Roles.TEACHER })
  role: Roles;

  @Column({ type: 'enum', enum: TeacherSpecification, nullable: true })
  specification: TeacherSpecification;

  @Column({ type: 'varchar', nullable: true })
  level: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  reasonDelete: string;

  @Column({ type: 'int', nullable: true })
  hourPrice: number;

  @Column({ type: 'varchar', nullable: true })
  portfolioLink: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  googleId: string;

  @Column({ type: 'text', nullable: true })
  googleRefreshToken: string;

  @Column({ type: 'text', nullable: true })
  googleAccessToken: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  experience: string;

  @Column({ type: 'uuid', nullable: true })
  lessons: string;
  @OneToMany(() => LessonTemplate, (template) => template.teacher, {
    cascade: true,
  })
  lessonTemplates: LessonTemplate[];

  @OneToMany(() => TeacherPayment, (payment) => payment.teacher, {
    cascade: true,
  })
  payments: TeacherPayment[];

  @OneToMany(() => Lesson, (lesson) => lesson.teacher, { cascade: true })
  lessonHistory: Lesson[];
}
