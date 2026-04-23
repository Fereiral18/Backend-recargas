import { Transaction } from 'typeorm';
import { SupportTicket } from '../../support/entities/support-ticket.entity';
export declare class User {
    uuid: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    role: string;
    status: string;
    balance: number;
    last_login: Date;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
    transactions: Transaction[];
    recharges: Recharge[];
    tickets: SupportTicket[];
    assigned_tickets: SupportTicket[];
    messages: SupportMessage[];
}
