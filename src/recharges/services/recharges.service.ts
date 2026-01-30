import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recharge } from '../entities/recharge.entity';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { RechargeStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Recharge)
    private readonly rechargeRepository: Repository<Recharge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createRechargeDto: CreateRechargeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate total
      const total = createRechargeDto.amount + createRechargeDto.fee;

      // Create recharge with unique reference
      const recharge = this.rechargeRepository.create({
        ...createRechargeDto,
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

  async findAll(filters: any) {
    const query = this.rechargeRepository.createQueryBuilder('recharge');

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

  async findOne(uuid: string) {
    const recharge = await this.rechargeRepository.findOne({ where: { uuid } });

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    return recharge;
  }

  async update(uuid: string, updateRechargeDto: UpdateRechargeDto) {
    const recharge = await this.findOne(uuid);

    Object.assign(recharge, updateRechargeDto);

    if (updateRechargeDto.status === RechargeStatus.COMPLETED) {
      recharge.completed_at = new Date();
    }

    return this.rechargeRepository.save(recharge);
  }

  async getStats(user_id?: string) {
    const query = this.rechargeRepository.createQueryBuilder('recharge');

    if (user_id) {
      query.where('recharge.user_id = :user_id', { user_id });
    }

    const total = await query.getCount();
    const pending = await query
      .clone()
      .andWhere('recharge.status = :status', { status: RechargeStatus.PENDING })
      .getCount();

    return {
      total,
      pending,
      completed: total - pending,
    };
  }
}
