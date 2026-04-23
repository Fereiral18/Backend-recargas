import { TicketPriority } from '../../common/enums';
export declare class CreateTicketDto {
    subject: string;
    description: string;
    category: string;
    priority?: TicketPriority;
}
