import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SupplierTopUpMapping } from '../entities/supplier-topup-mapping.entity';
import { CreateSupplierTopUpMappingDto } from '../dto/create-supplier-topup-mapping.dto';
import { UpdateSupplierTopUpMappingDto } from '../dto/update-supplier-topup-mapping.dto';
import { GameOperator } from '../../common/enums';

@Injectable()
export class SupplierTopUpMappingsService {
  constructor(
    @InjectRepository(SupplierTopUpMapping)
    private readonly mappingRepository: Repository<SupplierTopUpMapping>,
  ) {}

  async create(createDto: CreateSupplierTopUpMappingDto) {
    const mapping = this.mappingRepository.create(createDto);
    return this.mappingRepository.save(mapping);
  }

  async findAll() {
    return this.mappingRepository.find({ order: { operator: 'ASC', package: 'ASC' } });
  }

  async findOne(uuid: string) {
    const mapping = await this.mappingRepository.findOne({ where: { uuid } });

    if (!mapping) {
      throw new NotFoundException('Mapeo de proveedor no encontrado');
    }

    return mapping;
  }

  async update(uuid: string, updateDto: UpdateSupplierTopUpMappingDto) {
    const mapping = await this.findOne(uuid);
    Object.assign(mapping, updateDto);
    return this.mappingRepository.save(mapping);
  }

  async remove(uuid: string) {
    const mapping = await this.findOne(uuid);
    await this.mappingRepository.remove(mapping);
  }

  /**
   * Looks up the active mapping for a recharge's (operator, package). Tries
   * the exact package first, then falls back to a package-less default
   * mapping for that operator, if one was configured.
   */
  async findMapping(operator: GameOperator, packageId?: string | null) {
    if (packageId) {
      const exact = await this.mappingRepository.findOne({
        where: { operator, package: packageId, active: true },
      });

      if (exact) {
        return exact;
      }
    }

    return this.mappingRepository.findOne({ where: { operator, package: IsNull(), active: true } });
  }
}
