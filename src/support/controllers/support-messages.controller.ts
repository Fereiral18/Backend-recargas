import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupportMessagesService } from '../services/support-messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';

@ApiTags('support/messages')
@ApiBearerAuth()
@Controller('support/messages')
@UseGuards(JwtAuthGuard)
export class SupportMessagesController {
  constructor(private readonly messagesService: SupportMessagesService) {}

  @Post(':ticket_id')
  @ApiOperation({ summary: 'Create a new message in a ticket' })
  create(
    @Request() req: AuthenticatedRequest,
    @Param('ticket_id') ticket_id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.create(
      ticket_id,
      req.user.uuid,
      createMessageDto,
    );
  }

  @Get('ticket/:ticket_id')
  @ApiOperation({ summary: 'Get all messages for a ticket' })
  findByTicket(@Param('ticket_id') ticket_id: string) {
    return this.messagesService.findByTicket(ticket_id);
  }

  @Patch(':uuid/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@Param('uuid') uuid: string) {
    return this.messagesService.markAsRead(uuid);
  }
}
