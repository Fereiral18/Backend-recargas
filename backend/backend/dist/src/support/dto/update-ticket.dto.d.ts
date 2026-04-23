import { TicketStatus, TicketPriority } from '../../common/enums';
export declare class UpdateTicketDto {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigned_to?: string;
}
