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
import { SupplierTopUpMappingsService } from '../services/supplier-topup-mappings.service';
import { CreateSupplierTopUpMappingDto } from '../dto/create-supplier-topup-mapping.dto';
import { UpdateSupplierTopUpMappingDto } from '../dto/update-supplier-topup-mapping.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

@ApiTags('supplier-topup-mappings')
@ApiBearerAuth()
@Controller('supplier/topup-mappings')
@UseGuards(JwtAuthGuard)
export class SupplierTopUpMappingsController {
  constructor(private readonly mappingsService: SupplierTopUpMappingsService) {}

  private assertAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden gestionar mapeos de proveedor');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Map an (operator, package) to an FZR category/offer (admin only)' })
  create(@Body() createDto: CreateSupplierTopUpMappingDto, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.mappingsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List supplier top-up mappings (admin only)' })
  findAll(@Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.mappingsService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a mapping by UUID (admin only)' })
  findOne(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.mappingsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update a mapping (admin only)' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateSupplierTopUpMappingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    this.assertAdmin(req);
    return this.mappingsService.update(uuid, updateDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a mapping (admin only)' })
  remove(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.mappingsService.remove(uuid);
  }
}
