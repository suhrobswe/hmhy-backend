import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { TransactionStatus } from 'src/common/enum/index.enum';
import { BaseEntity } from './base.entity';

@Entity('transaction')
export class Transaction extends BaseEntity {
  @Column({ type: 'uuid' })
  lesson: string;

  @Column({ type: 'uuid' })
  student: string;

  @ManyToOne(() => Student, (student) => student.transactions)
  @JoinColumn({ name: 'student' })
  studentRelation: Student;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ type: 'timestamp', nullable: true })
  canceledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  performedTime: Date;

  @Column({ type: 'varchar', nullable: true })
  reason: string;
}
