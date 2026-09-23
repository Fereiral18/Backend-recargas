import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BalanceTopUpRequest } from '../entities/balance-topup-request.entity';
import { CreateBalanceTopUpRequestDto } from '../dto/create-balance-topup-request.dto';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { BalanceTopUpStatus, TransactionType, TransactionStatus } from '../../common/enums';

interface FindAllFilters {
  status?: BalanceTopUpStatus;
  user_id?: string;
  page?: number;
  limit?: number;
}

/**
 * Manages reseller requests to top up their prepaid balance. Unlike the
 * admin-only direct credit endpoint (users.service.creditBalance, kept for
 * ad-hoc adjustments), every request here carries proof of the transfer and
 * a review trail (who approved/rejected it, and when).
 */
@Injectable()
export class BalanceTopUpsService {
  constructor(
    @InjectRepository(BalanceTopUpRequest)
    private readonly requestRepository: Repository<BalanceTopUpRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateBalanceTopUpRequestDto, proofImagePath: string) {
    const request = this.requestRepository.create({
      user_id: userId,
      amount: dto.amount,
      note: dto.note,
      proof_image_path: proofImagePath,
      status: BalanceTopUpStatus.PENDING,
    });

    return this.requestRepository.save(request);
  }

  async findAll(filters: FindAllFilters) {
    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoin('request.user', 'user')
      .addSelect(['user.uuid', 'user.email', 'user.first_name', 'user.last_name']);

    if (filters.status) {
      query.andWhere('request.status = :status', { status: filters.status });
    }

    if (filters.user_id) {
      query.andWhere('request.user_id = :user_id', { user_id: filters.user_id });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('request.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(uuid: string) {
    const request = await this.requestRepository.findOne({ where: { uuid } });

    if (!request) {
      throw new NotFoundException('Solicitud de carga de saldo no encontrada');
    }

    return request;
  }

  /**
   * Approves a pending request: credits the reseller's balance and records
   * the matching DEPOSIT transaction, atomically with the status change, so
   * the balance can never move without the request ending up APPROVED (or
   * vice versa) even if something fails midway.
   */
  async approve(uuid: string, adminUuid: string, reviewNote?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock de fila: si dos admins aprueban la misma solicitud a la vez, el
      // segundo espera acá y después la ve ya APPROVED, en vez de acreditar
      // el saldo dos veces.
      const request = await queryRunner.manager.findOne(BalanceTopUpRequest, {
        where: { uuid },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new NotFoundException('Solicitud de carga de saldo no encontrada');
      }

      if (request.status !== BalanceTopUpStatus.PENDING) {
        throw new BadRequestException('Esta solicitud ya fue revisada');
      }

      // Mismo lock que usa la compra de un revendedor (RechargesService.create),
      // para que un débito concurrente no pise este crédito.
      const user = await queryRunner.manager.findOne(User, {
        where: { uuid: request.user_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      user.balance = parseFloat((Number(user.balance) + Number(request.amount)).toFixed(2));
      await queryRunner.manager.save(user);

      const transaction = queryRunner.manager.create(Transaction, {
        user_id: user.uuid,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: request.amount,
        fee: 0,
        net_amount: request.amount,
        reference: `TXN-TOPUP-${request.uuid}`,
        currency: 'USD',
        metadata: { topup_request_uuid: request.uuid, note: request.note },
        completed_at: new Date(),
      });
      await queryRunner.manager.save(transaction);

      request.status = BalanceTopUpStatus.APPROVED;
      request.reviewed_by = adminUuid;
      request.review_note = reviewNote;
      request.reviewed_at = new Date();
      await queryRunner.manager.save(request);

      await queryRunner.commitTransaction();

      return request;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Rejects a pending request. No balance movement, just leaves the review
   * trail (who rejected it, and why) for the reseller and future audits.
   */
  async reject(uuid: string, adminUuid: string, reviewNote?: string) {
    const request = await this.requestRepository.findOne({ where: { uuid } });

    if (!request) {
      throw new NotFoundException('Solicitud de carga de saldo no encontrada');
    }

    if (request.status !== BalanceTopUpStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya fue revisada');
    }

    request.status = BalanceTopUpStatus.REJECTED;
    request.reviewed_by = adminUuid;
    request.review_note = reviewNote;
    request.reviewed_at = new Date();

    return this.requestRepository.save(request);
  }
}
