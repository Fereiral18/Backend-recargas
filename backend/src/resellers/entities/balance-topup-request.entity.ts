import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BalanceTopUpStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

/**
 * A reseller's request to top up their prepaid balance after transferring
 * money off-platform (USDT, bank transfer, etc.). The reseller attaches
 * proof of the transfer; an admin verifies it independently and approves
 * (which credits the balance automatically) or rejects it. This is what
 * gives the manual balance-credit process an auditable trail instead of
 * relying entirely on conversations outside the system.
 */
@Entity('balance_topup_requests')
export class BalanceTopUpRequest {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'proof_image_path' })
  proof_image_path: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({
    type: 'enum',
    enum: BalanceTopUpStatus,
    default: BalanceTopUpStatus.PENDING,
  })
  status: BalanceTopUpStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewed_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  review_note: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
