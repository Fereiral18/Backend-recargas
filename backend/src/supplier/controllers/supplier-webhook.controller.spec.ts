import { Test, TestingModule } from '@nestjs/testing';
import { SupplierWebhookController } from './supplier-webhook.controller';
import { FzrCardsService } from '../services/fzr-cards.service';
import { RechargesService } from '../../recharges/services/recharges.service';

describe('SupplierWebhookController', () => {
  let controller: SupplierWebhookController;
  let fzrCardsService: jest.Mocked<FzrCardsService>;
  let rechargesService: jest.Mocked<RechargesService>;

  const mockRecharge = { uuid: 'recharge-uuid-1', supplier_order_id: 'fzr-order-1' };

  beforeEach(async () => {
    const mockFzrCardsService = { getOrder: jest.fn() };
    const mockRechargesService = {
      findBySupplierOrderId: jest.fn(),
      completeFromSupplier: jest.fn(),
      failFromSupplier: jest.fn(),
      recordSupplierOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierWebhookController],
      providers: [
        { provide: FzrCardsService, useValue: mockFzrCardsService },
        { provide: RechargesService, useValue: mockRechargesService },
      ],
    }).compile();

    controller = module.get(SupplierWebhookController);
    fzrCardsService = module.get(FzrCardsService);
    rechargesService = module.get(RechargesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should never trust the webhook body status: it always re-fetches the order before acting', async () => {
    rechargesService.findBySupplierOrderId.mockResolvedValue(mockRecharge as any);
    fzrCardsService.getOrder.mockResolvedValue({ order: { id: 'fzr-order-1', status: 'completed' } } as any);

    // Forged/garbage body claiming 'completed' means nothing on its own —
    // only the id is extracted; the status only matters coming from getOrder.
    await controller.handleWebhook({ order: { id: 'fzr-order-1', status: 'totally-fake-status' } });

    expect(fzrCardsService.getOrder).toHaveBeenCalledWith('fzr-order-1');
    expect(rechargesService.completeFromSupplier).toHaveBeenCalledWith(
      mockRecharge.uuid,
      'fzr-order-1',
      { id: 'fzr-order-1', status: 'completed' },
    );
  });

  it('should mark the recharge failed when the re-fetched order is refunded/failed', async () => {
    rechargesService.findBySupplierOrderId.mockResolvedValue(mockRecharge as any);
    fzrCardsService.getOrder.mockResolvedValue({ order: { id: 'fzr-order-1', status: 'refunded' } } as any);

    await controller.handleWebhook({ order_id: 'fzr-order-1' });

    expect(rechargesService.failFromSupplier).toHaveBeenCalledWith(
      mockRecharge.uuid,
      'fzr-order-1',
      { id: 'fzr-order-1', status: 'refunded' },
    );
  });

  it('should just refresh the snapshot when the order is still processing', async () => {
    rechargesService.findBySupplierOrderId.mockResolvedValue(mockRecharge as any);
    fzrCardsService.getOrder.mockResolvedValue({ order: { id: 'fzr-order-1', status: 'processing' } } as any);

    await controller.handleWebhook({ data: { id: 'fzr-order-1' } });

    expect(rechargesService.recordSupplierOrder).toHaveBeenCalledWith(
      mockRecharge.uuid,
      'fzr-order-1',
      { id: 'fzr-order-1', status: 'processing' },
    );
    expect(rechargesService.completeFromSupplier).not.toHaveBeenCalled();
    expect(rechargesService.failFromSupplier).not.toHaveBeenCalled();
  });

  it('should ignore a webhook with no recognizable order id, without calling FZR', async () => {
    const result = await controller.handleWebhook({ foo: 'bar' });

    expect(result).toEqual({ received: true });
    expect(fzrCardsService.getOrder).not.toHaveBeenCalled();
  });

  it('should ignore a webhook for an order id that matches no recharge of ours', async () => {
    rechargesService.findBySupplierOrderId.mockResolvedValue(null);

    const result = await controller.handleWebhook({ order: { id: 'unknown-order' } });

    expect(result).toEqual({ received: true });
    expect(fzrCardsService.getOrder).not.toHaveBeenCalled();
  });
});
