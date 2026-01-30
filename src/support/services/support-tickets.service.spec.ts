import { Test, TestingModule } from '@nestjs/testing';
import { SupportTicketsService } from './support-tickets.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupportTicket } from '../entities/support-ticket.entity';
import { NotFoundException } from '@nestjs/common';
import { TicketStatus, TicketPriority } from '../../common/enums';

describe('SupportTicketsService', () => {
  let service: SupportTicketsService;
  let repository: jest.Mocked<Repository<SupportTicket>>;

  const mockTicket = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    subject: 'Need help with recharge',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    assigned_to: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportTicketsService,
        { provide: getRepositoryToken(SupportTicket), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SupportTicketsService>(SupportTicketsService);
    repository = module.get(getRepositoryToken(SupportTicket));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      user_id: 'user-uuid-123',
      subject: 'Need help',
      priority: TicketPriority.MEDIUM,
    };

    it('should successfully create a ticket', async () => {
      repository.create.mockReturnValue(mockTicket as any);
      repository.save.mockResolvedValue(mockTicket as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTicket);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          status: TicketStatus.OPEN,
        }),
      );
    });

    it('should set status to OPEN by default', async () => {
      repository.create.mockReturnValue(mockTicket as any);
      repository.save.mockResolvedValue(mockTicket as any);

      await service.create(createDto);

      const createdTicket = repository.create.mock.calls[0][0];
      expect(createdTicket.status).toBe(TicketStatus.OPEN);
    });
  });

  describe('findAll', () => {
    it('should return array of tickets', async () => {
      repository.find.mockResolvedValue([mockTicket] as any);

      const result = await service.findAll();

      expect(result).toEqual([mockTicket]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should filter by user_id when provided', async () => {
      repository.find.mockResolvedValue([mockTicket] as any);

      await service.findAll('user-uuid-123');

      expect(repository.find).toHaveBeenCalledWith({
        where: { user_id: 'user-uuid-123' },
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by status when provided', async () => {
      repository.find.mockResolvedValue([mockTicket] as any);

      await service.findAll(undefined, TicketStatus.OPEN);

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: TicketStatus.OPEN },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a ticket with messages', async () => {
      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder as any).getOne = jest.fn().mockResolvedValue(mockTicket);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockTicket);
      expect(queryBuilder.where).toHaveBeenCalledWith('ticket.uuid = :uuid', {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('ticket.messages', 'messages');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder as any).getOne = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      status: TicketStatus.RESOLVED,
      assigned_to: 'admin-uuid-456',
    };

    it('should successfully update a ticket', async () => {
      const updatedTicket = { ...mockTicket, ...updateDto };
      repository.findOne.mockResolvedValue(mockTicket as any);
      repository.save.mockResolvedValue(updatedTicket as any);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(result.status).toBe(TicketStatus.RESOLVED);
      expect(result.assigned_to).toBe('admin-uuid-456');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return statistics for user tickets', async () => {
      const mockStats = {
        total: '15',
        open: '3',
        in_progress: '5',
        resolved: '6',
        closed: '1',
      };

      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder.getRawOne as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getStats('user-uuid-123');

      expect(result).toEqual(mockStats);
      expect(queryBuilder.where).toHaveBeenCalledWith('ticket.user_id = :userId', {
        userId: 'user-uuid-123',
      });
    });
  });
});
