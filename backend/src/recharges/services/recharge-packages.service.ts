import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RechargePackage } from '../entities/recharge-package.entity';
import { CreateRechargePackageDto } from '../dto/create-recharge-package.dto';
import { UpdateRechargePackageDto } from '../dto/update-recharge-package.dto';
import { GameOperator } from '../../common/enums';

/**
 * Admin-managed sale-price catalog. See RechargePackage for why this exists:
 * it's what lets an admin set the final price for both B2C and resellers
 * without a code deploy, and what RechargesService.create() trusts instead
 * of a client-supplied amount.
 */
@Injectable()
export class RechargePackagesService {
  constructor(
    @InjectRepository(RechargePackage)
    private readonly packageRepository: Repository<RechargePackage>,
  ) {}

  async create(createDto: CreateRechargePackageDto) {
    const pkg = this.packageRepository.create(createDto);
    return this.packageRepository.save(pkg);
  }

  async findAll(operator?: GameOperator) {
    return this.packageRepository.find({
      where: operator ? { operator } : {},
      order: { operator: 'ASC', b2c_price_ars: 'ASC' },
    });
  }

  async findOne(uuid: string) {
    const pkg = await this.packageRepository.findOne({ where: { uuid } });

    if (!pkg) {
      throw new NotFoundException('Paquete no encontrado');
    }

    return pkg;
  }

  async update(uuid: string, updateDto: UpdateRechargePackageDto) {
    const pkg = await this.findOne(uuid);
    Object.assign(pkg, updateDto);
    return this.packageRepository.save(pkg);
  }

  async remove(uuid: string) {
    const pkg = await this.findOne(uuid);
    await this.packageRepository.remove(pkg);
  }

  /**
   * Looks up the active, sellable package for a purchase. Returns null
   * (never throws) so callers can turn "no catalog entry" into their own
   * business error instead of a generic 404.
   */
  async findForPurchase(operator: GameOperator, packageId: string) {
    return this.packageRepository.findOne({ where: { operator, package: packageId, active: true } });
  }
}
