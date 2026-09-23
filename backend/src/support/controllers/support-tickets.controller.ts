import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SupportTicketsService } from '../services/support-tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

/**
 * Tickets are private to their owner: a client or reseller only ever sees
 * their own, regardless of what query params they send. Only admins can
 * list/view everyone's tickets or change status/priority/assignment.
 */
@ApiTags('support/tickets')
@ApiBearerAuth()
@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(private readonly ticketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketsService.create(req.user.uuid, createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets with filters (own tickets only, unless admin)' })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('user_id') user_id?: string,
    @Query('assigned_to') assigned_to?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;

    return this.ticketsService.findAll({
      // Un admin puede filtrar por cualquier user_id (o ninguno, para ver
      // todos); cualquier otro rol solo puede ver los suyos, sin importar
      // qué user_id haya mandado en la query.
      user_id: isAdmin ? user_id : req.user.uuid,
      assigned_to,
      status,
      priority,
      search,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics (own tickets only, unless admin)' })
  getStats(
    @Request() req: AuthenticatedRequest,
    @Query('user_id') user_id?: string,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;

    return this.ticketsService.getStats(isAdmin ? user_id : req.user.uuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get ticket by UUID (owner or admin only)' })
  async findOne(
    @Param('uuid') uuid: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const ticket = await this.ticketsService.findOne(uuid);

    if (ticket.user_id !== req.user.uuid && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver este ticket');
    }

    return ticket;
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update ticket status/priority/assignment (admin only)' })
  async update(
    @Param('uuid') uuid: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden actualizar tickets');
    }

    return this.ticketsService.update(uuid, updateTicketDto);
  }
}
