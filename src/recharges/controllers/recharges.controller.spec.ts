import { Test, TestingModule } from '@nestjs/testing';
import { RechargesController } from './recharges.controller';
import { RechargesService } from '../services/recharges.service';
import { RechargeStatus, RechargeType, GameOperator } from '../../common/enums';

describe('RechargesController', () => {
  let controller: RechargesController;
  let service: jest.Mocked<RechargesService>;

  const mockRecharge = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: RechargeType.DIAMONDS,
    operator: GameOperator.FREE_FIRE,
    amount: 100,
    fee: 5,
    total_amount: 105,
    status: RechargeStatus.COMPLETED,
    game_id: 'PLAYER123',
    reference: 'RCH-1234567890-ABC',
  };

  const mockRequest = {
    user: {
      uuid: 'user-uuid-123',
      role: 'USER',
    },
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RechargesController],
      providers: [{ provide: RechargesService, useValue: mockService }],
    }).compile();

    controller = module.get<RechargesController>(RechargesController);
    service = module.get(RechargesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      user_id: 'user-uuid-123',
      type: RechargeType.DIAMONDS,
      operator: GameOperator.FREE_FIRE,
      amount: 100,
      game_id: 'PLAYER123',
    };

    it('should create a recharge', async () => {
      service.create.mockResolvedValue(mockRecharge as any);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        message: 'Recharge created successfully',
        data: mockRecharge,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all recharges for admin', async () => {
      service.findAll.mockResolvedValue([mockRecharge] as any);

      const result = await controller.findAll(undefined, undefined, {
        user: { role: 'ADMIN' },
      } as any);

      expect(result).toEqual({
        message: 'Recharges retrieved successfully',
        data: [mockRecharge],
      });
    });

    it('should return only user recharges for regular user', async () => {
      service.findAll.mockResolvedValue([mockRecharge] as any);

      const result = await controller.findAll(undefined, undefined, mockRequest as any);

      expect(service.findAll).toHaveBeenCalledWith('user-uuid-123', undefined);
    });
  });

  describe('findOne', () => {
    it('should return a recharge by uuid', async () => {
      service.findOne.mockResolvedValue(mockRecharge as any);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual({
        message: 'Recharge retrieved successfully',
        data: mockRecharge,
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      status: RechargeStatus.COMPLETED,
    };

    it('should update a recharge', async () => {
      const updatedRecharge = { ...mockRecharge, ...updateDto };
      service.update.mockResolvedValue(updatedRecharge as any);

      const result = await controller.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(result).toEqual({
        message: 'Recharge updated successfully',
        data: updatedRecharge,
      });
    });
  });

  describe('getStats', () => {
    it('should return recharge statistics', async () => {
      const mockStats = {
        total: '10',
        completed: '7',
        pending: '2',
        failed: '1',
      };
      service.getStats.mockResolvedValue(mockStats as any);

      const result = await controller.getStats(mockRequest as any);

      expect(result).toEqual({
        message: 'Recharge statistics retrieved successfully',
        data: mockStats,
      });
      expect(service.getStats).toHaveBeenCalledWith('user-uuid-123');
    });
  });
});
