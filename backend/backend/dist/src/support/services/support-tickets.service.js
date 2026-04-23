"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportTicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const support_ticket_entity_1 = require("../entities/support-ticket.entity");
const enums_1 = require("../../common/enums");
let SupportTicketsService = class SupportTicketsService {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async create(user_id, createTicketDto) {
        const ticket = this.ticketRepository.create({
            user_id,
            ...createTicketDto,
        });
        return this.ticketRepository.save(ticket);
    }
    async findAll(filters) {
        const query = this.ticketRepository.createQueryBuilder('ticket');
        query.leftJoinAndSelect('ticket.user', 'user');
        query.leftJoinAndSelect('ticket.assigned_to_user', 'assigned_to_user');
        if (filters.user_id) {
            query.andWhere('ticket.user_id = :user_id', {
                user_id: filters.user_id,
            });
        }
        if (filters.assigned_to) {
            query.andWhere('ticket.assigned_to = :assigned_to', {
                assigned_to: filters.assigned_to,
            });
        }
        if (filters.status) {
            query.andWhere('ticket.status = :status', { status: filters.status });
        }
        if (filters.priority) {
            query.andWhere('ticket.priority = :priority', {
                priority: filters.priority,
            });
        }
        if (filters.search) {
            query.andWhere('(ticket.subject ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)', { search: `%${filters.search}%` });
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        query.skip((page - 1) * limit).take(limit);
        query.orderBy('ticket.created_at', 'DESC');
        const [tickets, total] = await query.getManyAndCount();
        return {
            data: tickets,
            total,
            page,
            limit,
        };
    }
    async findOne(uuid) {
        const ticket = await this.ticketRepository.findOne({
            where: { uuid },
            relations: ['messages'],
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        return ticket;
    }
    async update(uuid, updateTicketDto) {
        const ticket = await this.ticketRepository.findOne({ where: { uuid } });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        Object.assign(ticket, updateTicketDto);
        if (updateTicketDto.status === enums_1.TicketStatus.CLOSED) {
            ticket.closed_at = new Date();
        }
        return this.ticketRepository.save(ticket);
    }
    async getStats(user_id) {
        const query = this.ticketRepository.createQueryBuilder('ticket');
        if (user_id) {
            query.where('ticket.user_id = :user_id', { user_id });
        }
        const total = await query.getCount();
        const open = await query
            .clone()
            .andWhere('ticket.status = :status', { status: enums_1.TicketStatus.OPEN })
            .getCount();
        return {
            total,
            open,
            closed: total - open,
        };
    }
};
exports.SupportTicketsService = SupportTicketsService;
exports.SupportTicketsService = SupportTicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(support_ticket_entity_1.SupportTicket)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SupportTicketsService);
//# sourceMappingURL=support-tickets.service.js.map