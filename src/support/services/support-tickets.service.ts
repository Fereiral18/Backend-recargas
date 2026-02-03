import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../entities/support-ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketStatus } from '../../common/enums';

/**
 * Service for managing support tickets
 * Handles ticket creation, assignment, status updates, and queries
 */
@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
  ) {}

  /**
   * Create a new support ticket
   * @param user_id - UUID of the user creating the ticket
   * @param createTicketDto - Ticket data including category, priority, subject, and description
   * @returns Created ticket entity
   */
  async create(user_id: string, createTicketDto: CreateTicketDto) {
    const ticket = this.ticketRepository.create({
      user_id,
      ...createTicketDto,
    });

    return this.ticketRepository.save(ticket);
  }

  /**
   * Find all tickets with filters and pagination
   * @param filters - Filter options including user_id, assigned_to, status, priority, page, limit
   * @returns Paginated list of tickets
   */
  async findAll(filters: any) {
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
      query.andWhere(
        '(ticket.subject ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
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

  /**
   * Find a specific ticket by UUID with its messages
   * @param uuid - Ticket's unique identifier
   * @returns Ticket entity with related messages
   * @throws NotFoundException if ticket not found
   */
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

  /**
   * Update ticket status or assignment
   * Automatically sets closed_at when status changes to CLOSED
   * @param uuid - Ticket's unique identifier
   * @param updateTicketDto - Fields to update (status, assigned_to, etc.)
   * @returns Updated ticket entity
   * @throws NotFoundException if ticket not found
   */
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

  /**
   * Get support ticket statistics
   * @param user_id - Optional user ID to filter stats by specific user
   * @returns Object with total and open ticket counts
   */
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
