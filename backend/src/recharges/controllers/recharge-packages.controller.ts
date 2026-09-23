import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RechargePackagesService } from '../services/recharge-packages.service';
import { CreateRechargePackageDto } from '../dto/create-recharge-package.dto';
import { UpdateRechargePackageDto } from '../dto/update-recharge-package.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole, GameOperator } from '../../common/enums';

/**
 * Sale-price catalog. Any authenticated user can list active packages (so
 * the frontend can render real prices for both B2C and resellers); only
 * admins can create/edit/delete them.
 */
@ApiTags('recharge-packages')
@ApiBearerAuth()
@Controller('recharge-packages')
@UseGuards(JwtAuthGuard)
export class RechargePackagesController {
  constructor(private readonly packagesService: RechargePackagesService) {}

  private assertAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden gestionar el catálogo de precios');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a sellable package with its B2C/reseller price (admin only)' })
  create(@Body() createDto: CreateRechargePackageDto, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.packagesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List packages, optionally filtered by operator' })
  findAll(@Query('operator') operator?: GameOperator) {
    return this.packagesService.findAll(operator);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a package by UUID' })
  findOne(@Param('uuid') uuid: string) {
    return this.packagesService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update a package price/data (admin only)' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateRechargePackageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    this.assertAdmin(req);
    return this.packagesService.update(uuid, updateDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a package (admin only)' })
  remove(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.packagesService.remove(uuid);
  }
}
