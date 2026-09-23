import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResellerTier } from '../entities/reseller-tier.entity';
import { CreateResellerTierDto } from '../dto/create-reseller-tier.dto';
import { UpdateResellerTierDto } from '../dto/update-reseller-tier.dto';

/**
 * Manages the volume-based pricing tiers for B2B resellers.
 * Thresholds and names are business data (admin-configurable), not code.
 */
@Injectable()
export class ResellerTiersService {
  constructor(
    @InjectRepository(ResellerTier)
    private readonly tierRepository: Repository<ResellerTier>,
  ) {}

  async create(createDto: CreateResellerTierDto) {
    const tier = this.tierRepository.create(createDto);
    return this.tierRepository.save(tier);
  }

  async findAll() {
    return this.tierRepository.find({ order: { min_volume_usd: 'ASC' } });
  }

  async findOne(uuid: string) {
    const tier = await this.tierRepository.findOne({ where: { uuid } });

    if (!tier) {
      throw new NotFoundException('Reseller tier not found');
    }

    return tier;
  }

  async update(uuid: string, updateDto: UpdateResellerTierDto) {
    const tier = await this.findOne(uuid);
    Object.assign(tier, updateDto);
    return this.tierRepository.save(tier);
  }

  async remove(uuid: string) {
    const tier = await this.findOne(uuid);
    await this.tierRepository.remove(tier);
  }
}
