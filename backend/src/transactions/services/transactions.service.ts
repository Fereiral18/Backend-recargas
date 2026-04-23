import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionStatus } from '../../common/enums';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const fee = createTransactionDto.fee || 0;
    const net_amount = createTransactionDto.amount - fee;

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      fee,
      net_amount,
      reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currency: createTransactionDto.currency || 'USD',
      status: TransactionStatus.PENDING,
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(filters: any) {
    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (filters.user_id) {
      query.andWhere('transaction.user_id = :user_id', {
        user_id: filters.user_id,
      });
    }

    if (filters.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('transaction.status = :status', {
        status: filters.status,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('transaction.created_at', 'DESC');

    const [transactions, total] = await query.getManyAndCount();

    return {
      data: transactions,
      total,
      page,
      limit,
    };
  }

  async findOne(uuid: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { uuid },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(uuid: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.findOne(uuid);

    Object.assign(transaction, updateTransactionDto);

    if (updateTransactionDto.status === TransactionStatus.COMPLETED) {
      transaction.completed_at = new Date();
    }

    return this.transactionRepository.save(transaction);
  }

  async getUserBalance(user_id: string) {
    const transactions = await this.transactionRepository.find({
      where: { user_id, status: TransactionStatus.COMPLETED },
    });

    const balance = transactions.reduce((sum, t) => {
      if (t.type === 'DEPOSIT') return sum + Number(t.net_amount);
      return sum - Number(t.net_amount);
    }, 0);

    return {
      user_id,
      balance,
      total_transactions: transactions.length,
    };
  }

  async getStats(user_id?: string) {
    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (user_id) {
      query.where('transaction.user_id = :user_id', { user_id });
    }

    const total = await query.getCount();
    const pending = await query
      .clone()
      .andWhere('transaction.status = :status', { status: TransactionStatus.PENDING })
      .getCount();

    return {
      total,
      pending,
      completed: total - pending,
    };
  }
}
