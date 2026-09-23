import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupportTicketsService } from './support-tickets.service';
import { SupportTicket } from '../entities/support-ticket.entity';
import { TicketStatus, TicketPriority } from '../../common/enums';
import { RechargesService } from '../../recharges/services/recharges.service';

describe('SupportTicketsService', () => {
  let service: SupportTicketsService;
  let repository: jest.Mocked<Repository<SupportTicket>>;
  let rechargesService: { findOne: jest.Mock };

  const mockTicket = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    subject: 'Need help with recharge',
    description: 'My recharge is stuck',
    category: 'RECHARGE',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    assigned_to: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  let queryBuilderMock: any;

  beforeEach(async () => {
    queryBuilderMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getCount: jest.fn().mockResolvedValue(0),
      getOne: jest.fn().mockResolvedValue(mockTicket),
    };

    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    const mockRechargesService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportTicketsService,
        { provide: getRepositoryToken(SupportTicket), useValue: mockRepository },
        { provide: RechargesService, useValue: mockRechargesService },
      ],
    }).compile();

    service = module.get<SupportTicketsService>(SupportTicketsService);
    repository = module.get(getRepositoryToken(SupportTicket));
    rechargesService = module.get(RechargesService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      subject: 'Need help',
      description: 'My recharge is stuck',
      category: 'RECHARGE',
      priority: TicketPriority.MEDIUM,
    };

    it('should create a ticket for the given user', async () => {
      repository.create.mockReturnValue(mockTicket as any);
      repository.save.mockResolvedValue(mockTicket as any);

      const result = await service.create('user-uuid-123', createDto as any);

      expect(result).toEqual(mockTicket);
      expect(repository.create).toHaveBeenCalledWith({
        user_id: 'user-uuid-123',
        ...createDto,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('should link the ticket to a recharge owned by the same user', async () => {
      rechargesService.findOne.mockResolvedValue({ uuid: 'recharge-uuid-1', user_id: 'user-uuid-123' });
      repository.create.mockReturnValue(mockTicket as any);
      repository.save.mockResolvedValue(mockTicket as any);

      await service.create('user-uuid-123', { ...createDto, recharge_id: 'recharge-uuid-1' } as any);

      expect(rechargesService.findOne).toHaveBeenCalledWith('recharge-uuid-1');
      expect(repository.create).toHaveBeenCalledWith({
        user_id: 'user-uuid-123',
        ...createDto,
        recharge_id: 'recharge-uuid-1',
      });
    });

    it('should reject linking a recharge that belongs to a different user', async () => {
      rechargesService.findOne.mockResolvedValue({ uuid: 'recharge-uuid-1', user_id: 'someone-else' });

      await expect(
        service.create('user-uuid-123', { ...createDto, recharge_id: 'recharge-uuid-1' } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated tickets', async () => {
      queryBuilderMock.getManyAndCount.mockResolvedValue([[mockTicket], 1]);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [mockTicket], total: 1, page: 1, limit: 20 });
    });

    it('should apply filters when provided', async () => {
      await service.findAll({ user_id: 'user-uuid-123', status: TicketStatus.OPEN });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('ticket.user_id = :user_id', {
        user_id: 'user-uuid-123',
      });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('ticket.status = :status', {
        status: TicketStatus.OPEN,
      });
    });
  });

  describe('findOne', () => {
    it('should return a ticket with its messages', async () => {
      queryBuilderMock.getOne.mockResolvedValue(mockTicket);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockTicket);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('ticket.uuid = :uuid', {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      queryBuilderMock.getOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update ticket status and assignment', async () => {
      repository.findOne.mockResolvedValue({ ...mockTicket } as any);
      repository.save.mockImplementation(async (t) => t as any);

      const result: any = await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: TicketStatus.RESOLVED,
        assigned_to: 'admin-uuid-456',
      });

      expect(result.status).toBe(TicketStatus.RESOLVED);
      expect(result.assigned_to).toBe('admin-uuid-456');
    });

    it('should set closed_at when status changes to CLOSED', async () => {
      repository.findOne.mockResolvedValue({ ...mockTicket } as any);
      repository.save.mockImplementation(async (t) => t as any);

      const result: any = await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: TicketStatus.CLOSED,
      });

      expect(result.closed_at).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', { status: TicketStatus.RESOLVED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return total, open and closed counts', async () => {
      queryBuilderMock.getCount.mockResolvedValueOnce(15).mockResolvedValueOnce(3);

      const result = await service.getStats('user-uuid-123');

      expect(result).toEqual({ total: 15, open: 3, closed: 12 });
      expect(queryBuilderMock.where).toHaveBeenCalledWith('ticket.user_id = :user_id', {
        user_id: 'user-uuid-123',
      });
    });
  });
});
