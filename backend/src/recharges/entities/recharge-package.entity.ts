import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { GameOperator, RechargeType } from '../../common/enums';

/**
 * The sellable catalog: what an admin actually charges for one (operator,
 * package) combo, for each channel. B2C pays the ARS price via Mercado
 * Pago; resellers pay the USD price from their prepaid balance. This is the
 * source of truth for pricing — RechargesService.create() looks the price
 * up here instead of trusting whatever amount a client sends.
 */
@Entity('recharge_packages')
@Unique(['operator', 'package'])
export class RechargePackage {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    enum: GameOperator,
  })
  operator: GameOperator;

  // Matches Recharge.package / SupplierTopUpMapping.package (e.g. 'SMALL', 'PB_CARD').
  @Column()
  package: string;

  @Column({
    type: 'enum',
    enum: RechargeType,
  })
  type: RechargeType;

  @Column()
  name: string;

  @Column({ nullable: true })
  diamonds: number;

  @Column({ name: 'b2c_price_ars', type: 'decimal', precision: 10, scale: 2 })
  b2c_price_ars: number;

  @Column({ name: 'reseller_price_usd', type: 'decimal', precision: 10, scale: 2 })
  reseller_price_usd: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
