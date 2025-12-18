import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Roles, TeacherSpecification } from 'src/common/enum/index.enum';
import { LessonTemplate } from './lessonTemplate.entity';
import { TeacherPayment } from './teacherPayment.entity';
import { Lesson } from './lesson.entity';
import { DeletedTeacher } from './deletedTeacher.entity';

@Entity('teacher')
export class Teacher extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  cardNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'enum', enum: Roles, default: Roles.TEACHER })
  role: Roles;

  @Column({ type: 'enum', enum: TeacherSpecification, nullable: true })
  specification: TeacherSpecification;

  @Column({ type: 'varchar', nullable: true })
  level: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  hourPrice: number;

  @Column({ type: 'varchar', nullable: true })
  portfolioLink: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  googleId: string;

  @Column({ type: 'varchar', nullable: true })
  googleRefreshToken: string;

  @Column({ type: 'varchar', nullable: true })
  googleAccessToken: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  experience: string;

  @Column({ type: 'uuid', nullable: true })
  lessons: string;

  @OneToMany(() => LessonTemplate, (template) => template.teacher)
  lessonTemplates: LessonTemplate[];

  @OneToMany(() => TeacherPayment, (payment) => payment.teacher)
  payments: TeacherPayment[];

  @OneToMany(() => Lesson, (lesson) => lesson.teacher)
  lessonHistory: Lesson[];

  @OneToMany(() => DeletedTeacher, (deleted) => deleted.teacher)
  deletedRecords: DeletedTeacher[];
}
