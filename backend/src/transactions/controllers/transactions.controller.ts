import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

/**
 * Transactions are the revenue/balance ledger -- private to their owner,
 * same as support tickets. A client or reseller only ever sees their own,
 * regardless of what query params they send. Creating/editing entries
 * directly (outside the recharge/balance-topup flows that book them
 * automatically) is admin-only, since a transaction row feeds balance and
 * revenue reporting.
 */
@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  private assertAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden gestionar transacciones manualmente');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction (admin only)' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters (own transactions only, unless admin)' })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('user_id') user_id?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;

    return this.transactionsService.findAll({
      // Un admin puede filtrar por cualquier user_id (o ninguno, para ver
      // todas); cualquier otro rol solo puede ver las suyas, sin importar
      // qué user_id haya mandado en la query.
      user_id: isAdmin ? user_id : req.user.uuid,
      type,
      status,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics (own stats only, unless admin)' })
  getStats(@Request() req: AuthenticatedRequest, @Query('user_id') user_id?: string) {
    const isAdmin = req.user.role === UserRole.ADMIN;

    return this.transactionsService.getStats(isAdmin ? user_id : req.user.uuid);
  }

  @Get('revenue-stats')
  @ApiOperation({
    summary:
      'Revenue summary split B2C (ARS) vs reseller (USD), net of refunds (admin only). Optional ?from=&to= (ISO dates) to scope to a period, e.g. a month.',
  })
  getRevenueStats(
    @Request() req: AuthenticatedRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    this.assertAdmin(req);
    return this.transactionsService.getRevenueStats(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('balance/:user_id')
  @ApiOperation({ summary: 'Get user balance summary (own balance only, unless admin)' })
  getUserBalance(@Param('user_id') user_id: string, @Request() req: AuthenticatedRequest) {
    if (user_id !== req.user.uuid && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver ese balance');
    }

    return this.transactionsService.getUserBalance(user_id);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get transaction by UUID (owner or admin only)' })
  async findOne(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    const transaction = await this.transactionsService.findOne(uuid);

    if (transaction.user_id !== req.user.uuid && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver esta transacción');
    }

    return transaction;
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update transaction (admin only)' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    this.assertAdmin(req);
    return this.transactionsService.update(uuid, updateTransactionDto);
  }
}
