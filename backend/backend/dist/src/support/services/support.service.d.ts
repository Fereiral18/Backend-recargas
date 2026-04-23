import { SupportTicketsService } from './support-tickets.service';
import { SupportMessagesService } from './support-messages.service';
export declare class SupportService {
    private readonly ticketsService;
    private readonly messagesService;
    constructor(ticketsService: SupportTicketsService, messagesService: SupportMessagesService);
}
