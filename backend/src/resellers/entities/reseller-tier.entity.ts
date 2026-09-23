import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Volume-based pricing tier for B2B resellers.
 * Thresholds and discounts are business data, not code — kept here as a table
 * so they can be adjusted without a deploy once pricing is defined.
 */
@Entity('reseller_tiers')
export class ResellerTier {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'min_volume_usd', type: 'decimal', precision: 12, scale: 2 })
  min_volume_usd: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
