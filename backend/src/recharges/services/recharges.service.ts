import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recharge } from '../entities/recharge.entity';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import {
  RechargeStatus,
  RechargeModality,
  TransactionType,
  TransactionStatus,
  UserRole,
} from '../../common/enums';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { RechargePackagesService } from './recharge-packages.service';

interface ActingUser {
  uuid: string;
  role: UserRole | string;
}

/**
 * Service for managing game recharges (diamonds, UC, coins, etc.)
 * Handles CRUD operations and business logic for recharge transactions
 */
@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Recharge)
    private readonly rechargeRepository: Repository<Recharge>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rechargePackagesService: RechargePackagesService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new recharge request.
   * The price is never trusted from the client — it's looked up from the
   * sale-price catalog (RechargePackage) by (operator, package), which is
   * the only place an admin actually sets what B2C/resellers pay.
   * B2C users: pay afterwards via Mercado Pago (no balance involved here).
   * Resellers: paid immediately from their prepaid balance; the order still
   * starts PENDING because fulfillment (delivery/gift card) happens afterwards.
   * The acting user always comes from the authenticated JWT, never from the
   * request body, to prevent placing orders (and debiting balance) as someone else.
   */
  async create(createRechargeDto: CreateRechargeDto, actingUser: ActingUser) {
    const pkg = await this.rechargePackagesService.findForPurchase(
      createRechargeDto.operator,
      createRechargeDto.package,
    );

    if (!pkg) {
      throw new BadRequestException('Ese paquete no está disponible para este operador');
    }

    if (pkg.type !== createRechargeDto.type) {
      throw new BadRequestException('El paquete no corresponde al tipo de recarga indicado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const isReseller = actingUser.role === UserRole.RESELLER;
      const total = Number(isReseller ? pkg.reseller_price_usd : pkg.b2c_price_ars);
      let paidFromBalance = false;

      if (isReseller) {
        // Lock de fila: dos compras simultáneas del mismo revendedor se
        // serializan acá, así la segunda ve el saldo ya descontado y no se
        // puede gastar más de lo que hay.
        const user = await queryRunner.manager.findOne(User, {
          where: { uuid: actingUser.uuid },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (Number(user.balance) < total) {
          throw new BadRequestException('Saldo insuficiente');
        }

        user.balance = parseFloat((Number(user.balance) - total).toFixed(2));
        await queryRunner.manager.save(user);
        paidFromBalance = true;
      }

      const recharge = this.rechargeRepository.create({
        ...createRechargeDto,
        user_id: actingUser.uuid,
        modality: isReseller ? createRechargeDto.modality || RechargeModality.DIRECT : RechargeModality.DIRECT,
        amount: total,
        fee: 0,
        total,
        currency: isReseller ? 'USD' : 'ARS',
        paid_from_balance: paidFromBalance,
        reference: `RCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: RechargeStatus.PENDING,
      });

      await queryRunner.manager.save(recharge);

      if (paidFromBalance) {
        const transaction = queryRunner.manager.create(Transaction, {
          user_id: actingUser.uuid,
          type: TransactionType.PURCHASE,
          status: TransactionStatus.COMPLETED,
          amount: total,
          fee: 0,
          net_amount: total,
          reference: `TXN-${recharge.reference}`,
          currency: 'USD',
          metadata: { recharge_uuid: recharge.uuid },
          recharge_id: recharge.uuid,
          completed_at: new Date(),
        });
        await queryRunner.manager.save(transaction);
      }

      await queryRunner.commitTransaction();

      return recharge;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all recharges with optional filters and pagination
   * @param filters - Filter options including user_id, operator, status, search, page, and limit
   * @returns Paginated list of recharges with total count
   */
  async findAll(filters: any) {
    // leftJoin + addSelect (nunca leftJoinAndSelect) para no traer
    // user.password_hash junto con el resto de la fila.
    const query = this.rechargeRepository
      .createQueryBuilder('recharge')
      .leftJoin('recharge.user', 'user')
      .addSelect(['user.uuid', 'user.email', 'user.first_name', 'user.last_name', 'user.phone', 'user.role']);

    if (filters.user_id) {
      query.andWhere('recharge.user_id = :user_id', {
        user_id: filters.user_id,
      });
    }

    if (filters.operator) {
      query.andWhere('recharge.operator = :operator', {
        operator: filters.operator,
      });
    }

    if (filters.status) {
      query.andWhere('recharge.status = :status', { status: filters.status });
    }

    if (filters.search) {
      query.andWhere(
        '(recharge.reference ILIKE :search OR recharge.phone_number ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('recharge.created_at', 'DESC');

    const [recharges, total] = await query.getManyAndCount();

    return {
      data: recharges,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a specific recharge by UUID
   * @param uuid - Unique identifier of the recharge
   * @returns Recharge entity
   * @throws NotFoundException if recharge not found
   */
  async findOne(uuid: string) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    return recharge;
  }

  /**
   * Update recharge status and data.
   * Automatically sets completed_at when status changes to COMPLETED.
   * Records a PURCHASE transaction the first time a B2C recharge's payment
   * is confirmed — i.e. leaving PENDING into either PROCESSING (payment
   * confirmed, handed off to the supplier for automatic fulfillment) or
   * straight into COMPLETED (legacy proof-based flow, or an admin closing
   * it manually). Booking on "leaving PENDING" instead of "entering
   * COMPLETED" means a later PROCESSING → COMPLETED transition (the
   * supplier confirming delivery) doesn't book the revenue a second time.
   * Reseller orders were already charged at creation, so this never touches
   * balance/transactions again for them.
   * If a reseller order that was paid from balance ends up FAILED or CANCELLED,
   * the balance is refunded automatically.
   * @param uuid - Unique identifier of the recharge
   * @param updateRechargeDto - Fields to update (typically status)
   * @returns Updated recharge entity
   * @throws NotFoundException if recharge not found
   */
  async update(uuid: string, updateRechargeDto: UpdateRechargeDto) {
    const recharge = await this.rechargeRepository.findOne({
      where: { uuid },
    });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    const previousStatus = recharge.status;
    Object.assign(recharge, updateRechargeDto);

    const justConfirmedPayment =
      (updateRechargeDto.status === RechargeStatus.PROCESSING ||
        updateRechargeDto.status === RechargeStatus.COMPLETED) &&
      previousStatus === RechargeStatus.PENDING;

    const justCompleted =
      updateRechargeDto.status === RechargeStatus.COMPLETED && previousStatus !== RechargeStatus.COMPLETED;

    const justFailedOrCancelled =
      (updateRechargeDto.status === RechargeStatus.FAILED || updateRechargeDto.status === RechargeStatus.CANCELLED) &&
      previousStatus !== RechargeStatus.FAILED &&
      previousStatus !== RechargeStatus.CANCELLED;

    if (justCompleted) {
      recharge.completed_at = new Date();
    }

    const savedRecharge = await this.rechargeRepository.save(recharge);

    if (justConfirmedPayment && !recharge.paid_from_balance) {
      const transaction = this.transactionRepository.create({
        user_id: recharge.user_id,
        type: TransactionType.PURCHASE,
        status: TransactionStatus.COMPLETED,
        amount: recharge.total,
        fee: recharge.fee,
        net_amount: parseFloat((Number(recharge.total) - Number(recharge.fee)).toFixed(2)),
        reference: `TXN-${recharge.reference}`,
        currency: recharge.currency || 'ARS',
        metadata: { recharge_uuid: recharge.uuid },
        recharge_id: recharge.uuid,
        completed_at: recharge.completed_at || new Date(),
      });
      await this.transactionRepository.save(transaction);
    }

    if (justFailedOrCancelled && recharge.paid_from_balance) {
      await this.refundBalance(recharge);
    }

    return savedRecharge;
  }

  /**
   * Get recharge statistics
   * @param user_id - Optional user ID to filter stats by specific user
   * @returns Object with detailed recharge statistics
   */
  async getStats(user_id?: string) {
    const baseQuery = this.rechargeRepository.createQueryBuilder('recharge');

    if (user_id) {
      baseQuery.where('recharge.user_id = :user_id', { user_id });
    }

    // Total de recargas
    const total = await baseQuery.clone().getCount();

    // Por estado
    const pending = await baseQuery
      .clone()
      .andWhere('recharge.status = :status', { status: RechargeStatus.PENDING })
      .getCount();

    const processing = await baseQuery
      .clone()
      .andWhere('recharge.status = :status', { status: RechargeStatus.PROCESSING })
      .getCount();

    const completed = await baseQuery
      .clone()
      .andWhere('recharge.status = :status', { status: RechargeStatus.COMPLETED })
      .getCount();

    const failed = await baseQuery
      .clone()
      .andWhere('recharge.status = :status', { status: RechargeStatus.FAILED })
      .getCount();

    // Hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayQuery = baseQuery.clone().andWhere('recharge.created_at >= :today', { today });
    const todayTotal = await todayQuery.clone().getCount();
    const todayPending = await todayQuery
      .clone()
      .andWhere('recharge.status = :status', { status: RechargeStatus.PENDING })
      .getCount();

    // Monto total completado hoy
    const todayAmountResult = await this.rechargeRepository
      .createQueryBuilder('recharge')
      .select('COALESCE(SUM(recharge.amount), 0)', 'total')
      .where('recharge.created_at >= :today', { today })
      .andWhere('recharge.status = :status', { status: RechargeStatus.COMPLETED })
      .getRawOne();

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      todayTotal,
      todayPending,
      todayAmount: parseFloat(todayAmountResult?.total || 0),
    };
  }

  /**
   * Cancel a recharge by the user
   * Only allowed if PENDING and created less than 10 minutes ago.
   * Refunds the balance if the order had been paid from it.
   * @param uuid - Recharge UUID
   * @param userId - User UUID (must be the owner)
   * @returns Updated recharge with CANCELLED status
   */
  async cancelByUser(uuid: string, userId: string) {
    const recharge = await this.rechargeRepository.findOne({
      where: { uuid },
    });

    if (!recharge) {
      throw new NotFoundException('Recarga no encontrada');
    }

    // Verificar que sea el dueño
    if (recharge.user_id !== userId) {
      throw new NotFoundException('Recarga no encontrada');
    }

    // Verificar que esté pendiente
    if (recharge.status !== RechargeStatus.PENDING) {
      throw new BadRequestException('Solo puedes cancelar recargas pendientes');
    }

    // Verificar que tenga menos de 10 minutos
    const createdAt = new Date(recharge.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 10) {
      throw new BadRequestException('Solo puedes cancelar recargas dentro de los primeros 10 minutos');
    }

    recharge.status = RechargeStatus.CANCELLED;
    const savedRecharge = await this.rechargeRepository.save(recharge);

    if (recharge.paid_from_balance) {
      await this.refundBalance(recharge);
    }

    return savedRecharge;
  }

  /**
   * Marks a recharge as paid based on a confirmed Mercado Pago payment.
   * Stores the provider's payment id/payload for audit and moves the
   * recharge to PROCESSING (not COMPLETED): payment being confirmed just
   * means it's ready to be handed off to the supplier (FZR Cards) for
   * fulfillment, not that it was actually delivered yet. Reuses update()
   * so the existing transition logic (book the PURCHASE transaction once,
   * stay idempotent on retried webhooks) doesn't need to be duplicated here.
   */
  async markPaidByProvider(uuid: string, providerReference: string, providerResponse: unknown) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    recharge.provider_reference = providerReference;
    recharge.provider_response = providerResponse;
    await this.rechargeRepository.save(recharge);

    return this.update(uuid, { status: RechargeStatus.PROCESSING });
  }

  /**
   * Marks a recharge as failed based on a rejected/cancelled Mercado Pago
   * payment, so the user sees it failed instead of stuck PENDING forever.
   */
  async markFailedByProvider(uuid: string, providerReference: string, providerResponse: unknown) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    recharge.provider_reference = providerReference;
    recharge.provider_response = providerResponse;
    await this.rechargeRepository.save(recharge);

    return this.update(uuid, { status: RechargeStatus.FAILED });
  }

  /**
   * Finds a recharge by the supplier's (FZR Cards) order id. Used by the
   * supplier webhook, which only carries that id and never the recharge
   * uuid.
   */
  async findBySupplierOrderId(supplierOrderId: string) {
    return this.rechargeRepository.findOne({ where: { supplier_order_id: supplierOrderId } });
  }

  /**
   * Records that a supplier order was placed for this recharge, without
   * changing its status (it stays PROCESSING until the supplier confirms
   * delivery or failure).
   */
  async recordSupplierOrder(uuid: string, supplierOrderId: string, supplierResponse: unknown) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    recharge.supplier_order_id = supplierOrderId;
    recharge.supplier_response = supplierResponse;
    return this.rechargeRepository.save(recharge);
  }

  /**
   * Marks a recharge COMPLETED based on the supplier (FZR Cards) confirming
   * the order was delivered.
   */
  async completeFromSupplier(uuid: string, supplierOrderId: string, supplierResponse: unknown) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    recharge.supplier_order_id = supplierOrderId;
    recharge.supplier_response = supplierResponse;
    await this.rechargeRepository.save(recharge);

    return this.update(uuid, { status: RechargeStatus.COMPLETED });
  }

  /**
   * Marks a recharge FAILED based on the supplier (FZR Cards) rejecting or
   * refunding the order. Note: for B2C orders (never paid_from_balance) this
   * does NOT refund the customer's Mercado Pago payment automatically — that
   * still needs an admin to issue the MP refund manually.
   */
  async failFromSupplier(uuid: string, supplierOrderId: string, supplierResponse: unknown) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    recharge.supplier_order_id = supplierOrderId;
    recharge.supplier_response = supplierResponse;
    await this.rechargeRepository.save(recharge);

    return this.update(uuid, { status: RechargeStatus.FAILED });
  }

  /**
   * Credits back a reseller's balance for an order that was paid from it but
   * did not end up delivered, and records the matching REFUND transaction.
   * Idempotent: the REFUND transaction's reference is unique per recharge and
   * is inserted first, in the same DB transaction as the balance credit, so a
   * concurrent/repeated refund (e.g. two cancel requests at once, or a cancel
   * racing a supplier failure) hits the unique constraint and never credits
   * the balance twice.
   */
  private async refundBalance(recharge: Recharge) {
    const reference = `TXN-REFUND-${recharge.reference}`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refund = queryRunner.manager.create(Transaction, {
        user_id: recharge.user_id,
        type: TransactionType.REFUND,
        status: TransactionStatus.COMPLETED,
        amount: recharge.total,
        fee: 0,
        net_amount: recharge.total,
        reference,
        currency: 'USD',
        metadata: { recharge_uuid: recharge.uuid },
        recharge_id: recharge.uuid,
        completed_at: new Date(),
      });
      await queryRunner.manager.save(refund);

      // Incremento atómico en SQL (balance = balance + x), sin leer-modificar-
      // escribir, para no pisar un débito concurrente del mismo revendedor.
      await queryRunner.manager.increment(
        User,
        { uuid: recharge.user_id },
        'balance',
        Number(recharge.total),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Ya existía el REFUND de esta recarga: fue reembolsada antes, no-op.
      if ((error as { code?: string })?.code === '23505') {
        return;
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
