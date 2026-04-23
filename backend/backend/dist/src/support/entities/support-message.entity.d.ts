import { MessageType } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { SupportTicket } from './support-ticket.entity';
export declare class SupportMessage {
    uuid: string;
    ticket_id: string;
    user_id: string;
    message: string;
    type: MessageType;
    is_read: boolean;
    created_at: Date;
    ticket: SupportTicket;
    user: User;
}
