import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'first_name' })
  first_name: string;

  @Column({ name: 'last_name' })
  last_name: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'last_login', nullable: true })
  last_login: Date;

  @Column({ name: 'email_verified', default: false })
  email_verified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations - Corregido: transaction.user existe
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