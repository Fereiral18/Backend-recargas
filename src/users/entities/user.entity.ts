import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole, UserStatus } from '../../common/enums';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Recharge } from '../../recharges/entities/recharge.entity';
import { SupportTicket } from '../../support/entities/support-ticket.entity';
import { SupportMessage } from '../../support/entities/support-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ default: false })
  email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Recharge, (recharge) => recharge.user)
  recharges: Recharge[];

  @OneToMany(() => SupportTicket, (ticket) => ticket.user)
  tickets: SupportTicket[];

  @OneToMany(() => SupportTicket, (ticket) => ticket.assigned_to_user)
  assigned_tickets: SupportTicket[];

  @OneToMany(() => SupportMessage, (message) => message.user)
  messages: SupportMessage[];
}
