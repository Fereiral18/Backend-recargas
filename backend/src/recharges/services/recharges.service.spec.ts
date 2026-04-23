import { Test, TestingModule } from '@nestjs/testing';
import { RechargesService } from './recharges.service';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Recharge } from '../entities/recharge.entity';
import { NotFoundException } from '@nestjs/common';
import { RechargeStatus, RechargeType, GameOperator } from '../../common/enums';

describe('RechargesService', () => {
  let service: RechargesService;
  let repository: jest.Mocked<Repository<Recharge>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockRecharge = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: RechargeType.DIAMONDS,
    operator: GameOperator.FREE_FIRE,
    amount: 100,
    fee: 5,
    total_amount: 105,
    status: RechargeStatus.PENDING,
    game_id: 'PLAYER123',
    reference: 'RCH-1234567890-ABC',
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
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      })),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RechargesService,
        { provide: getRepositoryToken(Recharge), useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<RechargesService>(RechargesService);
    repository = module.get(getRepositoryToken(Recharge));
    dataSource = module.get(DataSource);
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
      type: RechargeType.DIAMONDS,
      operator: GameOperator.FREE_FIRE,
      amount: 100,
      game_id: 'PLAYER123',
    };

    it('should successfully create a recharge with transaction', async () => {
      const queryRunner = dataSource.createQueryRunner();
      repository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should calculate fee and total_amount correctly', async () => {
      const queryRunner = dataSource.createQueryRunner();
      repository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create(createDto);

      const createdRecharge = repository.create.mock.calls[0][0];
      expect(createdRecharge.fee).toBe(5); // 5% of 100
      expect(createdRecharge.total_amount).toBe(105);
    });

    it('should generate unique reference', async () => {
      const queryRunner = dataSource.createQueryRunner();
      repository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create(createDto);

      const createdRecharge = repository.create.mock.calls[0][0];
      expect(createdRecharge.reference).toMatch(/^RCH-\d+-[A-Z0-9]+$/);
    });

    it('should rollback transaction on error', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.save as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createDto)).rejects.toThrow();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of recharges', async () => {
      repository.find.mockResolvedValue([mockRecharge] as any);

      const result = await service.findAll();

      expect(result).toEqual([mockRecharge]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should apply filters when provided', async () => {
      repository.find.mockResolvedValue([mockRecharge] as any);

      await service.findAll('user-uuid-123', RechargeStatus.COMPLETED);

      expect(repository.find).toHaveBeenCalledWith({
        where: { user_id: 'user-uuid-123', status: RechargeStatus.COMPLETED },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a recharge by uuid', async () => {
      repository.findOne.mockResolvedValue(mockRecharge as any);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockRecharge);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should throw NotFoundException if recharge not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      status: RechargeStatus.COMPLETED,
    };

    it('should successfully update a recharge', async () => {
      const updatedRecharge = { ...mockRecharge, ...updateDto };
      repository.findOne.mockResolvedValue(mockRecharge as any);
      repository.save.mockResolvedValue(updatedRecharge as any);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(result.status).toBe(RechargeStatus.COMPLETED);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if recharge not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return statistics for user recharges', async () => {
      const mockStats = {
        total: '10',
        completed: '7',
        pending: '2',
        failed: '1',
        total_amount: '1000',
      };

      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder.getRawOne as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getStats('user-uuid-123');

      expect(result).toEqual(mockStats);
      expect(queryBuilder.where).toHaveBeenCalledWith('recharge.user_id = :userId', {
        userId: 'user-uuid-123',
      });
    });
  });
});
