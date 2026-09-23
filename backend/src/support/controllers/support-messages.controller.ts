import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SupportMessagesService } from '../services/support-messages.service';
import { SupportTicketsService } from '../services/support-tickets.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

/**
 * Messages live inside a ticket, so they inherit its privacy: only the
 * ticket's owner and admins can read or post into it — never a random
 * other authenticated user just because they know/guess the ticket id.
 */
@ApiTags('support/messages')
@ApiBearerAuth()
@Controller('support/messages')
@UseGuards(JwtAuthGuard)
export class SupportMessagesController {
  constructor(
    private readonly messagesService: SupportMessagesService,
    private readonly ticketsService: SupportTicketsService,
  ) {}

  private async assertTicketAccess(ticketId: string, user: { uuid: string; role: string }) {
    const ticket = await this.ticketsService.findOne(ticketId);

    if (ticket.user_id !== user.uuid && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para acceder a este ticket');
    }

    return ticket;
  }

  @Post(':ticket_id')
  @ApiOperation({ summary: 'Create a new message in a ticket (owner or admin only)' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('ticket_id') ticket_id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    await this.assertTicketAccess(ticket_id, req.user);

    return this.messagesService.create(
      ticket_id,
      req.user.uuid,
      createMessageDto,
    );
  }

  @Get('ticket/:ticket_id')
  @ApiOperation({ summary: 'Get all messages for a ticket (owner or admin only)' })
  async findByTicket(
    @Param('ticket_id') ticket_id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.assertTicketAccess(ticket_id, req.user);

    return this.messagesService.findByTicket(ticket_id);
  }

  @Patch(':uuid/read')
  @ApiOperation({ summary: 'Mark message as read (owner of the ticket or admin only)' })
  async markAsRead(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    const message = await this.messagesService.findOne(uuid);
    await this.assertTicketAccess(message.ticket_id, req.user);

    return this.messagesService.markAsRead(uuid);
  }
}
