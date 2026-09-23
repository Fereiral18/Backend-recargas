import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionType, TransactionStatus } from '../../common/enums';

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
    query.leftJoin('transaction.recharge', 'recharge');
    query.addSelect([
      'recharge.uuid',
      'recharge.reference',
      'recharge.operator',
      'recharge.package',
      'recharge.status',
    ]);

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
      relations: ['recharge'],
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

    // REFUND entra cuando una recarga de revendedor paga con balance falla y
    // se le devuelve la plata (ver RechargesService.refundBalance) -- antes
    // no se contaba acá, así que este total quedaba más bajo que el balance
    // real del usuario apenas había un reembolso de por medio.
    const totals = transactions.reduce(
      (acc, t) => {
        const net = Number(t.net_amount);
        if (t.type === TransactionType.DEPOSIT) acc.total_deposits += net;
        if (t.type === TransactionType.WITHDRAWAL) acc.total_withdrawals += net;
        if (t.type === TransactionType.PURCHASE) acc.total_purchases += net;
        if (t.type === TransactionType.REFUND) acc.total_refunds += net;
        if (t.type === TransactionType.FEE) acc.total_fees += net;
        return acc;
      },
      { total_deposits: 0, total_withdrawals: 0, total_purchases: 0, total_refunds: 0, total_fees: 0 },
    );

    return {
      user_id,
      total_balance:
        totals.total_deposits +
        totals.total_refunds -
        totals.total_withdrawals -
        totals.total_purchases -
        totals.total_fees,
      total_deposits: totals.total_deposits,
      total_withdrawals: totals.total_withdrawals,
      total_purchases: totals.total_purchases,
      total_refunds: totals.total_refunds,
      total_fees: totals.total_fees,
      total_transactions: transactions.length,
    };
  }

  /**
   * Revenue summary for admin auditing, split B2C vs reseller. The split is
   * just by currency -- B2C recharges are always booked in ARS (Mercado
   * Pago) and reseller ones always in USD (balance prepago), see
   * RechargesService.create() -- so no join to recharges/users is needed.
   * Refunds are netted out so a failed-and-refunded reseller order doesn't
   * look like real revenue.
   * @param from - Optional inclusive start of the period (e.g. first day of a month)
   * @param to - Optional exclusive end of the period
   */
  async getRevenueStats(from?: Date, to?: Date) {
    const query = this.transactionRepository
      .createQueryBuilder('t')
      .select('t.currency', 'currency')
      .addSelect('t.type', 'type')
      .addSelect('COALESCE(SUM(t.net_amount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t.type IN (:...types)', { types: [TransactionType.PURCHASE, TransactionType.REFUND] });

    if (from) {
      query.andWhere('t.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('t.created_at < :to', { to });
    }

    const rows = await query.groupBy('t.currency').addGroupBy('t.type').getRawMany();

    const byCurrency: Record<string, { gross: number; refunded: number; count: number }> = {
      ARS: { gross: 0, refunded: 0, count: 0 },
      USD: { gross: 0, refunded: 0, count: 0 },
    };

    for (const row of rows) {
      const bucket = (byCurrency[row.currency] ??= { gross: 0, refunded: 0, count: 0 });

      if (row.type === TransactionType.PURCHASE) {
        bucket.gross = Number(row.total);
        bucket.count = Number(row.count);
      } else if (row.type === TransactionType.REFUND) {
        bucket.refunded = Number(row.total);
      }
    }

    const toSummary = (currency: 'ARS' | 'USD') => ({
      currency,
      gross: byCurrency[currency].gross,
      refunded: byCurrency[currency].refunded,
      net: byCurrency[currency].gross - byCurrency[currency].refunded,
      count: byCurrency[currency].count,
    });

    return {
      b2c: toSummary('ARS'),
      reseller: toSummary('USD'),
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
