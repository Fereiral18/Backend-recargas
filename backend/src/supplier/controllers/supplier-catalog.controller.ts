import { Controller, Get, Post, Body, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FzrCardsService } from '../services/fzr-cards.service';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../users/interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

/**
 * Read-only passthrough to FZR Cards' live catalog, so an admin can look up
 * the right category_id/offer_id/field keys when creating a
 * SupplierTopUpMapping, instead of guessing from their Swagger docs.
 */
@ApiTags('supplier-catalog')
@ApiBearerAuth()
@Controller('supplier/fzr/catalog')
@UseGuards(JwtAuthGuard)
export class SupplierCatalogController {
  constructor(private readonly fzrCardsService: FzrCardsService) {}

  private assertAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden ver el catálogo del proveedor');
    }
  }

  @Get('balance')
  @ApiOperation({ summary: 'Our prepaid balance with FZR Cards (admin only)' })
  async getBalance(@Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.fzrCardsService.getBalance();
  }

  @Get('topups')
  @ApiOperation({ summary: 'List FZR top-up categories/games (admin only)' })
  async listTopupCategories(@Request() req: AuthenticatedRequest) {
    this.assertAdmin(req);
    return this.fzrCardsService.listTopupCategories();
  }

  @Get('topups/offers')
  @ApiOperation({ summary: 'List offers/packages and required fields for a category (admin only)' })
  async getTopupOffers(@Request() req: AuthenticatedRequest, @Query('category_id') categoryId: string) {
    this.assertAdmin(req);
    return this.fzrCardsService.getTopupOffers(categoryId);
  }

  @Post('topups/validate-id')
  @ApiOperation({ summary: 'Validate a player id against FZR before mapping/testing (admin only)' })
  async validateTopupId(
    @Request() req: AuthenticatedRequest,
    @Body() body: { category_id: string; fields: Record<string, string> },
  ) {
    this.assertAdmin(req);
    return this.fzrCardsService.validateTopupId(body.category_id, body.fields);
  }
}
