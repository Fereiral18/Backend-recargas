import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Res,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { RechargesService } from '../services/recharges.service';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, RechargeStatus } from '../../common/enums';
import { existsSync } from 'fs';
import { resolveProofPath } from '../../common/utils/resolve-proof-path';
import { SupplierFulfillmentService } from '../../supplier/services/supplier-fulfillment.service';

@ApiTags('recharges')
@ApiBearerAuth()
@Controller('recharges')
@UseGuards(JwtAuthGuard)
export class RechargesController {
  private readonly logger = new Logger(RechargesController.name);

  constructor(
    private readonly rechargesService: RechargesService,
    @Inject(forwardRef(() => SupplierFulfillmentService))
    private readonly supplierFulfillmentService: SupplierFulfillmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recharge' })
  async create(
    @Body() createRechargeDto: CreateRechargeDto,
    @CurrentUser() user: { uuid: string; role: UserRole },
  ) {
    // El dueño del pedido siempre es el usuario autenticado, nunca el user_id
    // que mande el body (evita crear/pagar pedidos a nombre de otro usuario).
    const recharge = await this.rechargesService.create(createRechargeDto, user);

    // Un pedido de revendedor ya se pagó solo (se descontó su balance al
    // crearse) -- su único límite real es ESE saldo contra el nuestro en
    // FZR Cards, no una revisión humana. Se completa automático, igual que
    // un pago de Mercado Pago confirmado (ver PaymentsController.handleWebhook).
    if (recharge.paid_from_balance) {
      const processing = await this.rechargesService.update(recharge.uuid, {
        status: RechargeStatus.PROCESSING,
      });

      try {
        return await this.supplierFulfillmentService.fulfillRecharge(recharge.uuid);
      } catch (error) {
        this.logger.error(
          `No se pudo cumplir automáticamente con el proveedor el pedido de revendedor ${recharge.uuid}`,
          error as Error,
        );
        return processing;
      }
    }

    return recharge;
  }

  @Get()
  @ApiOperation({ summary: 'Get all recharges with filters (own recharges only, unless admin)' })
  findAll(
    @CurrentUser() user: { uuid: string; role: UserRole },
    @Query('user_id') user_id?: string,
    @Query('operator') operator?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;

    return this.rechargesService.findAll({
      // Un admin puede filtrar por cualquier user_id (o ninguno, para ver
      // todas); cualquier otro rol solo puede ver las suyas, sin importar
      // qué user_id haya mandado en la query.
      user_id: isAdmin ? user_id : user.uuid,
      operator,
      status,
      search,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get recharge statistics (own stats only, unless admin)' })
  getStats(
    @CurrentUser() user: { uuid: string; role: UserRole },
    @Query('user_id') user_id?: string,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;

    return this.rechargesService.getStats(isAdmin ? user_id : user.uuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get recharge by UUID (owner or admin only)' })
  async findOne(
    @Param('uuid') uuid: string,
    @CurrentUser() user: { uuid: string; role: UserRole },
  ) {
    const recharge = await this.rechargesService.findOne(uuid);

    if (recharge.user_id !== user.uuid && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver esta recarga');
    }

    return recharge;
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

    // proof_image_path es algo como "/uploads/proofs/uuid.webp"; resolveProofPath
    // garantiza que la ruta final no pueda salir de uploads/proofs.
    const filePath = resolveProofPath(recharge.proof_image_path);

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
  @ApiOperation({ summary: 'Update recharge status (admin only; B2C orders can only be advanced automatically)' })
  async update(
    @Param('uuid') uuid: string,
    @Body() updateRechargeDto: UpdateRechargeDto,
    @CurrentUser() user: { uuid: string; role: UserRole },
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden actualizar recargas');
    }

    const recharge = await this.rechargesService.findOne(uuid);

    // B2C ya no tiene aprobación manual: el pago se confirma solo vía
    // Mercado Pago y la entrega solo vía el webhook del proveedor (FZR). Un
    // admin puede seguir cancelando/marcando fallida una que quedó trabada,
    // pero no puede "hacerse pasar" por esos webhooks y darla por completada.
    const isManualPaymentConfirmation =
      !recharge.paid_from_balance &&
      (updateRechargeDto.status === RechargeStatus.PROCESSING ||
        updateRechargeDto.status === RechargeStatus.COMPLETED);

    if (isManualPaymentConfirmation) {
      throw new BadRequestException(
        'Las recargas de clientes finales se pagan y se completan automáticamente (Mercado Pago + proveedor); no se pueden marcar manualmente',
      );
    }

    return this.rechargesService.update(uuid, updateRechargeDto);
  }
}
