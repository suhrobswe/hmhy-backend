import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../core/entity/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionStatus } from 'src/common/enum/index.enum';
import { successRes } from 'src/infrastructure/response/success.response';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepo.create(createTransactionDto);
    const saved = await this.transactionRepo.save(transaction);
    return successRes(saved, 201);
  }

  async findAll() {
    const transactions = await this.transactionRepo.find({
      relations: ['studentRelation'],
      order: { createdAt: 'DESC' },
    });
    return successRes(transactions);
  }

  async getStats() {
    const transactions = await this.transactionRepo.find({
      relations: ['studentRelation'],
    });

    const totalRevenue = transactions
      .filter((t) => t.status === TransactionStatus.PAID)
      .reduce((sum, t) => sum + Number(t.price), 0);

    const pending = transactions.filter(
      (t) => t.status === TransactionStatus.PENDING,
    );
    const completed = transactions.filter(
      (t) => t.status === TransactionStatus.PAID,
    );
    const canceled = transactions.filter(
      (t) => t.status === TransactionStatus.PENDING_CANCELED,
    );

    const successRate =
      transactions.length > 0
        ? ((completed.length / transactions.length) * 100).toFixed(1)
        : '0';

    return successRes({
      totalRevenue,
      pendingPayments: pending.length,
      pendingAmount: pending.reduce((sum, t) => sum + Number(t.price), 0),
      successRate: Number(successRate),
      completedCount: completed.length,
      canceledCount: canceled.length,
      canceledAmount: canceled.reduce((sum, t) => sum + Number(t.price), 0),
      totalTransactions: transactions.length,
      transactions: transactions.map((t) => ({
        id: t.id,
        date: t.createdAt,
        student: t.studentRelation
          ? {
              id: t.studentRelation.id,
              name: `${t.studentRelation.firstName} ${t.studentRelation.lastName}`,
            }
          : null,
        teacher: null,
        amount: t.price,
        status: t.status,
        provider: 'Click',
      })),
    });
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['studentRelation'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return successRes(transaction);
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.transactionRepo.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    Object.assign(transaction, updateTransactionDto);

    if (updateTransactionDto.status === TransactionStatus.PAID) {
      transaction.performedTime = new Date();
    }

    if (updateTransactionDto.status === TransactionStatus.PENDING_CANCELED) {
      transaction.canceledTime = new Date();
    }

    const updated = await this.transactionRepo.save(transaction);
    return successRes(updated);
  }

  async remove(id: string) {
    const transaction = await this.transactionRepo.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.transactionRepo.remove(transaction);
    return successRes({ message: 'Transaction deleted successfully' });
  }
}
