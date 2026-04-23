import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { RechargesService } from '../services/recharges.service';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { multerConfig } from '../../common/config/multer.config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiTags('recharges')
@ApiBearerAuth()
@Controller('recharges')
@UseGuards(JwtAuthGuard)
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recharge' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('proof_image', multerConfig))
  create(
    @Body() createRechargeDto: CreateRechargeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Si hay archivo, agregar la ruta al DTO
    if (file) {
      createRechargeDto.proof_image_path = `/uploads/proofs/${file.filename}`;
    }
    return this.rechargesService.create(createRechargeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recharges with filters' })
  findAll(
    @Query('user_id') user_id?: string,
    @Query('operator') operator?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rechargesService.findAll({
      user_id,
      operator,
      status,
      search,
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

  @Get(':uuid/proof')
  @ApiOperation({ summary: 'Get proof image for a recharge (protected)' })
  async getProofImage(
    @Param('uuid') uuid: string,
    @CurrentUser() user: { uuid: string; role: UserRole },
    @Res() res: Response,
  ) {
    const recharge = await this.rechargesService.findOne(uuid);
    
    if (!recharge) {
      throw new NotFoundException('Recarga no encontrada');
    }

    // Verificar que el usuario sea el dueño o sea admin
    if (recharge.user_id !== user.uuid && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para ver este comprobante');
    }

    if (!recharge.proof_image_path) {
      throw new NotFoundException('Esta recarga no tiene comprobante');
    }

    // Construir la ruta absoluta del archivo
    // proof_image_path es algo como "/uploads/proofs/uuid.webp"
    const fileName = recharge.proof_image_path.replace('/uploads/proofs/', '');
    const filePath = join(process.cwd(), 'uploads', 'proofs', fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo de comprobante no encontrado');
    }

    return res.sendFile(filePath);
  }

  @Patch(':uuid/cancel')
  @ApiOperation({ summary: 'Cancel own recharge (only if PENDING and < 10 min old)' })
  async cancelByUser(
    @Param('uuid') uuid: string,
    @CurrentUser() user: { uuid: string; role: UserRole },
  ) {
    return this.rechargesService.cancelByUser(uuid, user.uuid);
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
