import { Repository } from 'typeorm';
import { Admin } from '../entity/admin.entity';

export type AdminRepository = Repository<Admin>;
