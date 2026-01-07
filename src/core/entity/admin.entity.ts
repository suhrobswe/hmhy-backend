import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Roles } from 'src/common/enum/index.enum';

@Entity('admin')
export class Admin extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.ADMIN })
  role: Roles;
}
