import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../entities/support-ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketStatus } from '../../common/enums';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
  ) {}

  async create(user_id: string, createTicketDto: CreateTicketDto) {
    const ticket = this.ticketRepository.create({
      user_id,
      ...createTicketDto,
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll(filters: any) {
    const query = this.ticketRepository.createQueryBuilder('ticket');

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

  async findOne(uuid: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { uuid },
      relations: ['messages'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(uuid: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid } });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    Object.assign(ticket, updateTicketDto);

    if (updateTicketDto.status === TicketStatus.CLOSED) {
      ticket.closed_at = new Date();
    }

    return this.ticketRepository.save(ticket);
  }

  async getStats(user_id?: string) {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (user_id) {
      query.where('ticket.user_id = :user_id', { user_id });
    }

    const total = await query.getCount();
    const open = await query
      .clone()
      .andWhere('ticket.status = :status', { status: TicketStatus.OPEN })
      .getCount();

    return {
      total,
      open,
      closed: total - open,
    };
  }
}
