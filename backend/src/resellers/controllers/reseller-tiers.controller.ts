import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResellerTiersService } from '../services/reseller-tiers.service';
import { CreateResellerTierDto } from '../dto/create-reseller-tier.dto';
import { UpdateResellerTierDto } from '../dto/update-reseller-tier.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

@ApiTags('reseller-tiers')
@ApiBearerAuth()
@Controller('reseller-tiers')
@UseGuards(JwtAuthGuard)
export class ResellerTiersController {
  constructor(private readonly tiersService: ResellerTiersService) {}

  private assertAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden gestionar tiers de revendedor');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a reseller tier (admin only)' })
  create(@Body() createDto: CreateResellerTierDto, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.tiersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List reseller tiers' })
  findAll() {
    return this.tiersService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a reseller tier by UUID' })
  findOne(@Param('uuid') uuid: string) {
    return this.tiersService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update a reseller tier (admin only)' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateResellerTierDto,
    @Request() req: AuthenticatedRequest,
  ) {
    this.assertAdmin(req);
    return this.tiersService.update(uuid, updateDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a reseller tier (admin only)' })
  remove(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.tiersService.remove(uuid);
  }
}
