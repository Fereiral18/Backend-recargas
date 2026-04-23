import { SupportTicketsService } from '../services/support-tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
export declare class SupportTicketsController {
    private readonly ticketsService;
    constructor(ticketsService: SupportTicketsService);
    create(req: AuthenticatedRequest, createTicketDto: CreateTicketDto): Promise<import("../entities/support-ticket.entity").SupportTicket>;
    findAll(user_id?: string, assigned_to?: string, status?: string, priority?: string, search?: string, page?: number, limit?: number): Promise<{
        data: import("../entities/support-ticket.entity").SupportTicket[];
        total: number;
        page: any;
        limit: any;
    }>;
    getStats(user_id?: string): Promise<{
        total: number;
        open: number;
        closed: number;
    }>;
    findOne(uuid: string): Promise<import("../entities/support-ticket.entity").SupportTicket>;
    update(uuid: string, updateTicketDto: UpdateTicketDto): Promise<import("../entities/support-ticket.entity").SupportTicket>;
}
