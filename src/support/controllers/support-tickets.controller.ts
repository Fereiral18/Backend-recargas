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
} from '@nestjs/common';
import { SupportTicketsService } from '../services/support-tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';

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
  @ApiOperation({ summary: 'Get all tickets with filters' })
  findAll(
    @Query('user_id') user_id?: string,
    @Query('assigned_to') assigned_to?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ticketsService.findAll({
      user_id,
      assigned_to,
      status,
      priority,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  getStats(@Query('user_id') user_id?: string) {
    return this.ticketsService.getStats(user_id);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get ticket by UUID' })
  findOne(@Param('uuid') uuid: string) {
    return this.ticketsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update ticket' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(uuid, updateTicketDto);
  }
}
