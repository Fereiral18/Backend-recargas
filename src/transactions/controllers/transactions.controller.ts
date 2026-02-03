import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters' })
  findAll(
    @Query('user_id') user_id?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.transactionsService.findAll({
      user_id,
      type,
      status,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  getStats(@Query('user_id') user_id?: string) {
    return this.transactionsService.getStats(user_id);
  }

  @Get('balance/:user_id')
  @ApiOperation({ summary: 'Get user balance summary' })
  getUserBalance(@Param('user_id') user_id: string) {
    return this.transactionsService.getUserBalance(user_id);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get transaction by UUID' })
  findOne(@Param('uuid') uuid: string) {
    return this.transactionsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update transaction' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(uuid, updateTransactionDto);
  }
}
