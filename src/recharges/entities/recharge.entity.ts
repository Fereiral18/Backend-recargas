import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RechargeType, RechargeStatus, GameOperator } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('recharges')
export class Recharge {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: RechargeType,
  })
  type: RechargeType;

  @Column({
    type: 'enum',
    enum: RechargeStatus,
    default: RechargeStatus.PENDING,
  })
  status: RechargeStatus;

  @Column()
  phone_number: string; // Player ID

  @Column({
    type: 'enum',
    enum: GameOperator,
  })
  operator: GameOperator;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  package: string; // Diamond package ID (e.g., 'SMALL', 'BASIC', etc.)

  @Column({ nullable: true })
  currency: string; // Payment currency (USDT, PAYPAL, etc.)

  @Column({ nullable: true })
  payment_method: string; // Payment method (Binance, MetaMask, etc.)

  @Column({ nullable: true })
  transaction_id: string; // External transaction ID

  @Column({ nullable: true })
  proof_image_path: string; // Path to uploaded proof image

  @Column({ nullable: true })
  provider_reference: string;

  @Column({ type: 'json', nullable: true })
  provider_response: any;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.recharges)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
