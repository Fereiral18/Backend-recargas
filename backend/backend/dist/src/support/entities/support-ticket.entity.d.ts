import { TicketStatus, TicketPriority } from '../../common/enums';
export declare class SupportTicket {
    uuid: string;
    user_id: string;
    assigned_to: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    created_at: Date;
    updated_at: Date;
    closed_at: Date;
    user: User;
    assigned_to_user: User;
    messages: SupportMessage[];
}
