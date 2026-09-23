import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameOperator } from '../../common/enums';

/**
 * Maps one of our (operator, package) combos to the corresponding FZR Cards
 * catalog entry (category_id/offer_id) plus which of FZR's `fields` key
 * receives the player id. This exists because our public API keeps the
 * fixed GameOperator enum + free-text package the frontend already uses,
 * while FZR's catalog is a dynamic, price-bearing set of strings we don't
 * want baked into an enum — an admin curates this mapping instead.
 */
@Entity('supplier_topup_mappings')
export class SupplierTopUpMapping {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    enum: GameOperator,
  })
  operator: GameOperator;

  // Matches Recharge.package (e.g. 'SMALL', 'BASIC'). Null means "the
  // default mapping for this operator" when packages aren't used.
  @Column({ nullable: true })
  package: string;

  @Column({ name: 'fzr_category_id' })
  fzr_category_id: string;

  @Column({ name: 'fzr_offer_id' })
  fzr_offer_id: string;

  // The key inside FZR's offer `fields` that should receive our
  // recharge.phone_number (the player id) — varies per game category.
  @Column({ name: 'fzr_player_id_field_key' })
  fzr_player_id_field_key: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
