import { Repository } from 'typeorm';
import { Transaction } from '../entity/transaction.entity';

export type TransactionRepository = Repository<Transaction>;
