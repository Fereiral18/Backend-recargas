import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { resolveProofPath } from '../../common/utils/resolve-proof-path';
import { BalanceTopUpsService } from '../services/balance-topups.service';
import { CreateBalanceTopUpRequestDto } from '../dto/create-balance-topup-request.dto';
import { ReviewBalanceTopUpRequestDto } from '../dto/review-balance-topup-request.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { multerConfig, assertUploadedImage } from '../../common/config/multer.config';
import { UserRole, BalanceTopUpStatus } from '../../common/enums';

/**
 * Reseller-facing balance top-up requests: submit proof of an off-platform
 * transfer, admin reviews and approves/rejects. See BalanceTopUpsService for
 * why this exists alongside the older direct-credit admin endpoint.
 */
@ApiTags('balance-topups')
@ApiBearerAuth()
@Controller('balance-topups')
@UseGuards(JwtAuthGuard)
export class BalanceTopUpsController {
  constructor(private readonly topupsService: BalanceTopUpsService) {}

  private assertAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden revisar solicitudes de carga de saldo');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Request a balance top-up with proof of transfer (resellers only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('proof_image', multerConfig))
  async create(
    @Body() createDto: CreateBalanceTopUpRequestDto,
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (req.user.role !== UserRole.RESELLER) {
      // Multer ya guardó el archivo antes de llegar acá: no dejarlo huérfano.
      if (file) {
        await unlink(file.path).catch(() => undefined);
      }
      throw new ForbiddenException('Solo los revendedores pueden solicitar carga de saldo');
    }

    if (!file) {
      throw new BadRequestException('Debés adjuntar el comprobante de la transferencia');
    }

    // Verifica el contenido real del archivo (no solo el MIME que declara el cliente).
    await assertUploadedImage(file);

    const request = await this.topupsService.create(
      req.user.uuid,
      createDto,
      `/uploads/proofs/${file.filename}`,
    );

    return {
      message: 'Solicitud enviada, queda pendiente de revisión',
      data: request,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List balance top-up requests (admin sees all, resellers see only their own)' })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: BalanceTopUpStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user_id = req.user.role === UserRole.ADMIN ? undefined : req.user.uuid;
    const result = await this.topupsService.findAll({ status, user_id, page, limit });

    return {
      message: 'Solicitudes obtenidas correctamente',
      data: result.data,
      meta: { total: result.total, page: result.page, limit: result.limit },
    };
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a balance top-up request by UUID' })
  async findOne(@Param('uuid') uuid: string, @Request() req: AuthenticatedRequest) {
    const request = await this.topupsService.findOne(uuid);

    if (request.user_id !== req.user.uuid && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver esta solicitud');
    }

    return { message: 'Solicitud obtenida correctamente', data: request };
  }

  @Get(':uuid/proof')
  @ApiOperation({ summary: 'Get the transfer proof image for a request (owner or admin only)' })
  async getProofImage(
    @Param('uuid') uuid: string,
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const request = await this.topupsService.findOne(uuid);

    if (request.user_id !== req.user.uuid && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver este comprobante');
    }

    const filePath = resolveProofPath(request.proof_image_path);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo de comprobante no encontrado');
    }

    return res.sendFile(filePath);
  }

  @Patch(':uuid/approve')
  @ApiOperation({ summary: 'Approve a request: credits the balance automatically (admin only)' })
  async approve(
    @Param('uuid') uuid: string,
    @Body() reviewDto: ReviewBalanceTopUpRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    this.assertAdmin(req);

    const request = await this.topupsService.approve(uuid, req.user.uuid, reviewDto.review_note);

    return { message: 'Solicitud aprobada y saldo acreditado', data: request };
  }

  @Patch(':uuid/reject')
  @ApiOperation({ summary: 'Reject a request: no balance movement (admin only)' })
  async reject(
    @Param('uuid') uuid: string,
    @Body() reviewDto: ReviewBalanceTopUpRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    this.assertAdmin(req);

    const request = await this.topupsService.reject(uuid, req.user.uuid, reviewDto.review_note);

    return { message: 'Solicitud rechazada', data: request };
  }
}
