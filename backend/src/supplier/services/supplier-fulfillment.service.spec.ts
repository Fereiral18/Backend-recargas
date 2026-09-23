import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SupplierFulfillmentService } from './supplier-fulfillment.service';
import { FzrCardsService } from './fzr-cards.service';
import { SupplierTopUpMappingsService } from './supplier-topup-mappings.service';
import { RechargesService } from '../../recharges/services/recharges.service';
import { GameOperator, RechargeType } from '../../common/enums';

describe('SupplierFulfillmentService', () => {
  let service: SupplierFulfillmentService;
  let fzrCardsService: jest.Mocked<FzrCardsService>;
  let mappingsService: jest.Mocked<SupplierTopUpMappingsService>;
  let rechargesService: jest.Mocked<RechargesService>;

  const mockRecharge = {
    uuid: 'recharge-uuid-1',
    type: RechargeType.DIAMONDS,
    operator: GameOperator.FREE_FIRE,
    package: 'SMALL',
    phone_number: 'PLAYER123',
  };

  const mockMapping = {
    uuid: 'mapping-uuid-1',
    operator: GameOperator.FREE_FIRE,
    package: 'SMALL',
    fzr_category_id: 'free-fire',
    fzr_offer_id: 'ff_100_diamonds',
    fzr_player_id_field_key: 'player_id',
    active: true,
  };

  beforeEach(async () => {
    const mockFzrCardsService = { placeTopupOrder: jest.fn() };
    const mockMappingsService = { findMapping: jest.fn() };
    const mockRechargesService = { findOne: jest.fn(), recordSupplierOrder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierFulfillmentService,
        { provide: FzrCardsService, useValue: mockFzrCardsService },
        { provide: SupplierTopUpMappingsService, useValue: mockMappingsService },
        { provide: RechargesService, useValue: mockRechargesService },
      ],
    }).compile();

    service = module.get(SupplierFulfillmentService);
    fzrCardsService = module.get(FzrCardsService);
    mappingsService = module.get(SupplierTopUpMappingsService);
    rechargesService = module.get(RechargesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should place the FZR order using the mapped category/offer/field and the recharge uuid as idempotency key', async () => {
    rechargesService.findOne.mockResolvedValue(mockRecharge as any);
    mappingsService.findMapping.mockResolvedValue(mockMapping as any);
    fzrCardsService.placeTopupOrder.mockResolvedValue({ order: { id: 'fzr-order-1' } } as any);
    rechargesService.recordSupplierOrder.mockResolvedValue({ ...mockRecharge } as any);

    await service.fulfillRecharge(mockRecharge.uuid);

    expect(mappingsService.findMapping).toHaveBeenCalledWith(GameOperator.FREE_FIRE, 'SMALL');
    expect(fzrCardsService.placeTopupOrder).toHaveBeenCalledWith(
      'free-fire',
      'ff_100_diamonds',
      { player_id: 'PLAYER123' },
      mockRecharge.uuid,
    );
    expect(rechargesService.recordSupplierOrder).toHaveBeenCalledWith(
      mockRecharge.uuid,
      'fzr-order-1',
      { order: { id: 'fzr-order-1' } },
    );
  });

  it('should throw BadRequestException when no mapping is configured', async () => {
    rechargesService.findOne.mockResolvedValue(mockRecharge as any);
    mappingsService.findMapping.mockResolvedValue(null);

    await expect(service.fulfillRecharge(mockRecharge.uuid)).rejects.toThrow(BadRequestException);
    expect(fzrCardsService.placeTopupOrder).not.toHaveBeenCalled();
  });

  it('should propagate errors from FZR order placement without recording a supplier order', async () => {
    rechargesService.findOne.mockResolvedValue(mockRecharge as any);
    mappingsService.findMapping.mockResolvedValue(mockMapping as any);
    fzrCardsService.placeTopupOrder.mockRejectedValue(new Error('FZR balance insuficiente'));

    await expect(service.fulfillRecharge(mockRecharge.uuid)).rejects.toThrow('FZR balance insuficiente');
    expect(rechargesService.recordSupplierOrder).not.toHaveBeenCalled();
  });
});
