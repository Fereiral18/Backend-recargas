import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TicketStatus, TicketPriority } from '../../common/enums';
import { SupportMessage } from './support-message.entity';
import { User } from '../../users/entities/user.entity';
import { Recharge } from '../../recharges/entities/recharge.entity';


@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_to: string;

  // Recarga a la que refiere este ticket, si el usuario lo abrió desde ahí
  // ("Reportar un problema"). Antes solo quedaba mencionada como texto libre
  // en la descripción, sin ninguna forma confiable de ubicar esa recarga
  // desde el ticket.
  @Column({ type: 'uuid', nullable: true })
  recharge_id: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column()
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.assigned_tickets)
  @JoinColumn({ name: 'assigned_to' })
  assigned_to_user: User;

  @ManyToOne(() => Recharge, { nullable: true })
  @JoinColumn({ name: 'recharge_id' })
  recharge: Recharge;

  @OneToMany(() => SupportMessage, (message) => message.ticket)
  messages: SupportMessage[];
}
