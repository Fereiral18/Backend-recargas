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
import { RechargesService } from '../services/recharges.service';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('recharges')
@ApiBearerAuth()
@Controller('recharges')
@UseGuards(JwtAuthGuard)
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recharge' })
  create(@Body() createRechargeDto: CreateRechargeDto) {
    return this.rechargesService.create(createRechargeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recharges with filters' })
  findAll(
    @Query('user_id') user_id?: string,
    @Query('operator') operator?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rechargesService.findAll({
      user_id,
      operator,
      status,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get recharge statistics' })
  getStats(@Query('user_id') user_id?: string) {
    return this.rechargesService.getStats(user_id);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get recharge by UUID' })
  findOne(@Param('uuid') uuid: string) {
    return this.rechargesService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update recharge' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateRechargeDto: UpdateRechargeDto,
  ) {
    return this.rechargesService.update(uuid, updateRechargeDto);
  }
}
