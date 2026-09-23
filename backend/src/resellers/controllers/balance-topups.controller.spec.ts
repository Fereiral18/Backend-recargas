import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { BalanceTopUpsController } from './balance-topups.controller';
import { BalanceTopUpsService } from '../services/balance-topups.service';
import { BalanceTopUpStatus, UserRole } from '../../common/enums';
import { assertUploadedImage } from '../../common/config/multer.config';

// The file content check reads from disk; it has its own spec, so here it's
// stubbed and we only assert the controller calls it.
jest.mock('../../common/config/multer.config', () => ({
  ...jest.requireActual('../../common/config/multer.config'),
  assertUploadedImage: jest.fn().mockResolvedValue(undefined),
}));

describe('BalanceTopUpsController', () => {
  let controller: BalanceTopUpsController;
  let service: jest.Mocked<BalanceTopUpsService>;

  const mockRequest = {
    uuid: 'topup-uuid-1',
    user_id: 'reseller-uuid-1',
    amount: 200,
    proof_image_path: '/uploads/proofs/abc.jpg',
    status: BalanceTopUpStatus.PENDING,
  };

  const reseller = { user: { uuid: 'reseller-uuid-1', role: UserRole.RESELLER } } as any;
  const otherReseller = { user: { uuid: 'other-reseller-uuid', role: UserRole.RESELLER } } as any;
  const admin = { user: { uuid: 'admin-uuid', role: UserRole.ADMIN } } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceTopUpsController],
      providers: [{ provide: BalanceTopUpsService, useValue: mockService }],
    }).compile();

    controller = module.get<BalanceTopUpsController>(BalanceTopUpsController);
    service = module.get(BalanceTopUpsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto = { amount: 200, note: 'Transferencia' };
    const file = { filename: 'abc.jpg' } as any;

    it('should create a request when a reseller uploads a proof', async () => {
      service.create.mockResolvedValue(mockRequest as any);

      const result = await controller.create(dto as any, reseller, file);

      expect(assertUploadedImage).toHaveBeenCalledWith(file);
      expect(service.create).toHaveBeenCalledWith('reseller-uuid-1', dto, '/uploads/proofs/abc.jpg');
      expect(result.data).toEqual(mockRequest);
    });

    it('should not create a request if the uploaded file is not really an image', async () => {
      (assertUploadedImage as jest.Mock).mockRejectedValueOnce(new BadRequestException('no es imagen'));

      await expect(controller.create(dto as any, reseller, file)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should reject non-reseller users', async () => {
      await expect(controller.create(dto as any, admin, file)).rejects.toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should require a proof file', async () => {
      await expect(controller.create(dto as any, reseller, undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should scope the listing to their own requests for a reseller', async () => {
      service.findAll.mockResolvedValue({ data: [mockRequest], total: 1, page: 1, limit: 20 } as any);

      await controller.findAll(reseller);

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'reseller-uuid-1' }),
      );
    });

    it('should list every request for an admin', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await controller.findAll(admin);

      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ user_id: undefined }));
    });
  });

  describe('findOne', () => {
    it('should allow the owner to see their own request', async () => {
      service.findOne.mockResolvedValue(mockRequest as any);

      const result = await controller.findOne('topup-uuid-1', reseller);

      expect(result.data).toEqual(mockRequest);
    });

    it('should reject a reseller trying to see someone else\'s request', async () => {
      service.findOne.mockResolvedValue(mockRequest as any);

      await expect(controller.findOne('topup-uuid-1', otherReseller)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow an admin to see any request', async () => {
      service.findOne.mockResolvedValue(mockRequest as any);

      const result = await controller.findOne('topup-uuid-1', admin);

      expect(result.data).toEqual(mockRequest);
    });
  });

  describe('approve', () => {
    it('should approve as admin', async () => {
      service.approve.mockResolvedValue({ ...mockRequest, status: BalanceTopUpStatus.APPROVED } as any);

      const result = await controller.approve('topup-uuid-1', { review_note: 'ok' }, admin);

      expect(service.approve).toHaveBeenCalledWith('topup-uuid-1', 'admin-uuid', 'ok');
      expect(result.data.status).toBe(BalanceTopUpStatus.APPROVED);
    });

    it('should reject non-admins', async () => {
      await expect(controller.approve('topup-uuid-1', {}, reseller)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.approve).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should reject as admin', async () => {
      service.reject.mockResolvedValue({ ...mockRequest, status: BalanceTopUpStatus.REJECTED } as any);

      const result = await controller.reject('topup-uuid-1', { review_note: 'no coincide' }, admin);

      expect(service.reject).toHaveBeenCalledWith('topup-uuid-1', 'admin-uuid', 'no coincide');
      expect(result.data.status).toBe(BalanceTopUpStatus.REJECTED);
    });

    it('should reject non-admins', async () => {
      await expect(controller.reject('topup-uuid-1', {}, reseller)).rejects.toThrow(ForbiddenException);
      expect(service.reject).not.toHaveBeenCalled();
    });
  });
});
