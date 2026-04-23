import { Repository } from 'typeorm';
import { SupportTicket } from '../entities/support-ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
export declare class SupportTicketsService {
    private readonly ticketRepository;
    constructor(ticketRepository: Repository<SupportTicket>);
    create(user_id: string, createTicketDto: CreateTicketDto): Promise<SupportTicket>;
    findAll(filters: any): Promise<{
        data: SupportTicket[];
        total: number;
        page: any;
        limit: any;
    }>;
    findOne(uuid: string): Promise<SupportTicket>;
    update(uuid: string, updateTicketDto: UpdateTicketDto): Promise<SupportTicket>;
    getStats(user_id?: string): Promise<{
        total: number;
        open: number;
        closed: number;
    }>;
}
