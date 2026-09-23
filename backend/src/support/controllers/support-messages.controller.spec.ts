import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SupportMessagesController } from './support-messages.controller';
import { SupportMessagesService } from '../services/support-messages.service';
import { SupportTicketsService } from '../services/support-tickets.service';
import { UserRole } from '../../common/enums';

describe('SupportMessagesController', () => {
  let controller: SupportMessagesController;
  let messagesService: jest.Mocked<SupportMessagesService>;
  let ticketsService: jest.Mocked<SupportTicketsService>;

  const mockTicket = { uuid: 'ticket-uuid-1', user_id: 'owner-uuid' };

  const owner = { uuid: 'owner-uuid', role: UserRole.USER };
  const stranger = { uuid: 'stranger-uuid', role: UserRole.USER };
  const admin = { uuid: 'admin-uuid', role: UserRole.ADMIN };

  beforeEach(async () => {
    const mockMessagesService = {
      create: jest.fn(),
      findByTicket: jest.fn(),
      findOne: jest.fn(),
      markAsRead: jest.fn(),
    };

    const mockTicketsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportMessagesController],
      providers: [
        { provide: SupportMessagesService, useValue: mockMessagesService },
        { provide: SupportTicketsService, useValue: mockTicketsService },
      ],
    }).compile();

    controller = module.get(SupportMessagesController);
    messagesService = module.get(SupportMessagesService);
    ticketsService = module.get(SupportTicketsService);
  });

  describe('create', () => {
    it('should let the ticket owner post a message', async () => {
      ticketsService.findOne.mockResolvedValue(mockTicket as any);
      messagesService.create.mockResolvedValue({} as any);

      await controller.create({ user: owner } as any, 'ticket-uuid-1', { message: 'hola' } as any);

      expect(messagesService.create).toHaveBeenCalledWith('ticket-uuid-1', owner.uuid, {
        message: 'hola',
      });
    });

    it('should let an admin post a message into any ticket', async () => {
      ticketsService.findOne.mockResolvedValue(mockTicket as any);
      messagesService.create.mockResolvedValue({} as any);

      await controller.create({ user: admin } as any, 'ticket-uuid-1', { message: 'hola' } as any);

      expect(messagesService.create).toHaveBeenCalled();
    });

    it('should reject a stranger trying to post into a ticket that is not theirs', async () => {
      ticketsService.findOne.mockResolvedValue(mockTicket as any);

      await expect(
        controller.create({ user: stranger } as any, 'ticket-uuid-1', { message: 'hola' } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(messagesService.create).not.toHaveBeenCalled();
    });
  });

  describe('findByTicket', () => {
    it('should let the owner read the messages of their own ticket', async () => {
      ticketsService.findOne.mockResolvedValue(mockTicket as any);
      messagesService.findByTicket.mockResolvedValue([]);

      await controller.findByTicket('ticket-uuid-1', { user: owner } as any);

      expect(messagesService.findByTicket).toHaveBeenCalledWith('ticket-uuid-1');
    });

    it('should reject a stranger trying to read messages of a ticket that is not theirs', async () => {
      ticketsService.findOne.mockResolvedValue(mockTicket as any);

      await expect(
        controller.findByTicket('ticket-uuid-1', { user: stranger } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(messagesService.findByTicket).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    const mockMessage = { uuid: 'message-uuid-1', ticket_id: 'ticket-uuid-1' };

    it('should let the ticket owner mark a message as read', async () => {
      messagesService.findOne.mockResolvedValue(mockMessage as any);
      ticketsService.findOne.mockResolvedValue(mockTicket as any);
      messagesService.markAsRead.mockResolvedValue({} as any);

      await controller.markAsRead('message-uuid-1', { user: owner } as any);

      expect(ticketsService.findOne).toHaveBeenCalledWith('ticket-uuid-1');
      expect(messagesService.markAsRead).toHaveBeenCalledWith('message-uuid-1');
    });

    it('should reject a stranger marking a message of a ticket that is not theirs', async () => {
      messagesService.findOne.mockResolvedValue(mockMessage as any);
      ticketsService.findOne.mockResolvedValue(mockTicket as any);

      await expect(
        controller.markAsRead('message-uuid-1', { user: stranger } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(messagesService.markAsRead).not.toHaveBeenCalled();
    });
  });
});
