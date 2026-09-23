import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from '../services/support-tickets.service';
import { UserRole } from '../../common/enums';

describe('SupportTicketsController', () => {
  let controller: SupportTicketsController;
  let service: jest.Mocked<SupportTicketsService>;

  const mockTicket = {
    uuid: 'ticket-uuid-1',
    user_id: 'owner-uuid',
    subject: 'Ayuda con mi recarga',
    status: 'OPEN',
  };

  const owner = { uuid: 'owner-uuid', role: UserRole.USER };
  const stranger = { uuid: 'stranger-uuid', role: UserRole.USER };
  const admin = { uuid: 'admin-uuid', role: UserRole.ADMIN };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportTicketsController],
      providers: [{ provide: SupportTicketsService, useValue: mockService }],
    }).compile();

    controller = module.get(SupportTicketsController);
    service = module.get(SupportTicketsService);
  });

  describe('findAll', () => {
    it('should force user_id to the caller for a non-admin, ignoring any user_id in the query', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await controller.findAll({ user: owner } as any, 'someone-elses-uuid');

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: owner.uuid }),
      );
    });

    it('should let an admin filter by any user_id, or none at all', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await controller.findAll({ user: admin } as any, 'someone-elses-uuid');

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'someone-elses-uuid' }),
      );

      await controller.findAll({ user: admin } as any, undefined);

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: undefined }),
      );
    });
  });

  describe('findOne', () => {
    it('should let the owner view their own ticket', async () => {
      service.findOne.mockResolvedValue(mockTicket as any);

      const result = await controller.findOne('ticket-uuid-1', { user: owner } as any);

      expect(result).toEqual(mockTicket);
    });

    it('should let an admin view any ticket', async () => {
      service.findOne.mockResolvedValue(mockTicket as any);

      const result = await controller.findOne('ticket-uuid-1', { user: admin } as any);

      expect(result).toEqual(mockTicket);
    });

    it('should reject a user who does not own the ticket', async () => {
      service.findOne.mockResolvedValue(mockTicket as any);

      await expect(
        controller.findOne('ticket-uuid-1', { user: stranger } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should reject a non-admin trying to update a ticket, even their own', async () => {
      await expect(
        controller.update('ticket-uuid-1', { status: 'CLOSED' } as any, { user: owner } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should let an admin update a ticket', async () => {
      service.update.mockResolvedValue({ ...mockTicket, status: 'CLOSED' } as any);

      await controller.update('ticket-uuid-1', { status: 'CLOSED' } as any, { user: admin } as any);

      expect(service.update).toHaveBeenCalledWith('ticket-uuid-1', { status: 'CLOSED' });
    });
  });
});
