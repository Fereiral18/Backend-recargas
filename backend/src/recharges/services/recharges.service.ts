import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recharge } from '../entities/recharge.entity';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { RechargeStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

/**
 * Service for managing game recharges (diamonds, UC, coins, etc.)
 * Handles CRUD operations and business logic for recharge transactions
 */
@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Recharge)
    private readonly rechargeRepository: Repository<Recharge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new recharge request
   * Uses transaction to ensure data consistency
   * @param createRechargeDto - Recharge data including type, operator, amount, fee, and game ID
   * @returns Created recharge entity with generated reference and pending status
   * @throws Error if transaction fails
   * @example
   * const recharge = await rechargesService.create({
   *   user_id: 'uuid-123',
   *   type: RechargeType.DIAMONDS,
   *   operator: GameOperator.FREE_FIRE,
   *   amount: 100,
   *   fee: 5,
   *   game_id: 'PLAYER123'
   * });
   */
  async create(createRechargeDto: CreateRechargeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate fee as 50% of amount (the amount received already includes the fee)
      const fee = createRechargeDto.amount / 3; // amount = price + (price * 0.5), so fee = amount / 3
      
      // Total is the amount itself (since it already includes the fee)
      const total = createRechargeDto.amount;

      // Create recharge with unique reference
      const recharge = this.rechargeRepository.create({
        ...createRechargeDto,
        fee: parseFloat(fee.toFixed(2)),
        total,
        reference: `RCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: RechargeStatus.PENDING,
      });

      await queryRunner.manager.save(recharge);
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
    const query = this.rechargeRepository
      .createQueryBuilder('recharge')
      .leftJoinAndSelect('recharge.user', 'user');

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
   * Update recharge status and data
   * Automatically sets completed_at when status changes to COMPLETED
   * Also updates user balance when recharge is completed
   * @param uuid - Unique identifier of the recharge
   * @param updateRechargeDto - Fields to update (typically status)
   * @returns Updated recharge entity
   * @throws NotFoundException if recharge not found
   */
  async update(uuid: string, updateRechargeDto: UpdateRechargeDto) {
    const recharge = await this.rechargeRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    const previousStatus = recharge.status;
    Object.assign(recharge, updateRechargeDto);

    if (updateRechargeDto.status === RechargeStatus.COMPLETED && previousStatus !== RechargeStatus.COMPLETED) {
      recharge.completed_at = new Date();
      
      // Actualizar el balance del usuario
      if (recharge.user) {
        const currentBalance = parseFloat(recharge.user.balance?.toString() || '0');
        recharge.user.balance = currentBalance + parseFloat(recharge.amount.toString());
        await this.userRepository.save(recharge.user);
      }
    }

    return this.rechargeRepository.save(recharge);
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
      completed,
      failed,
      todayTotal,
      todayPending,
      todayAmount: parseFloat(todayAmountResult?.total || 0),
    };
  }

  /**
   * Cancel a recharge by the user
   * Only allowed if PENDING and created less than 10 minutes ago
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
    return this.rechargeRepository.save(recharge);
  }
}
