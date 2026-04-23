import { Repository } from 'typeorm';
import { SupportMessage } from '../entities/support-message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
export declare class SupportMessagesService {
    private readonly messageRepository;
    constructor(messageRepository: Repository<SupportMessage>);
    create(ticket_id: string, user_id: string, createMessageDto: CreateMessageDto): Promise<SupportMessage>;
    findByTicket(ticket_id: string): Promise<SupportMessage[]>;
    markAsRead(uuid: string): Promise<SupportMessage>;
}
