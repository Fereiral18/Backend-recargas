import { SupportMessagesService } from '../services/support-messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
export declare class SupportMessagesController {
    private readonly messagesService;
    constructor(messagesService: SupportMessagesService);
    create(req: AuthenticatedRequest, ticket_id: string, createMessageDto: CreateMessageDto): Promise<import("../entities/support-message.entity").SupportMessage>;
    findByTicket(ticket_id: string): Promise<import("../entities/support-message.entity").SupportMessage[]>;
    markAsRead(uuid: string): Promise<import("../entities/support-message.entity").SupportMessage>;
}
