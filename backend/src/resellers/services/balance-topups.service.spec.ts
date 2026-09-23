import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BalanceTopUpsService } from './balance-topups.service';
import { BalanceTopUpRequest } from '../entities/balance-topup-request.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { BalanceTopUpStatus, TransactionType, TransactionStatus } from '../../common/enums';

describe('BalanceTopUpsService', () => {
  let service: BalanceTopUpsService;
  let requestRepository: jest.Mocked<Repository<BalanceTopUpRequest>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockRequest = {
    uuid: 'topup-uuid-1',
    user_id: 'reseller-uuid-1',
    amount: 200,
    proof_image_path: '/uploads/proofs/abc.jpg',
    note: 'Transferencia USDT',
    status: BalanceTopUpStatus.PENDING,
    created_at: new Date(),
  };

  let queryBuilderMock: any;
  let queryRunnerMock: any;

  beforeEach(async () => {
    queryBuilderMock = {
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    const mockRequestRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    const mockUserRepository = {};
    const mockTransactionRepository = {};

    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn((_entity, data) => data),
      },
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceTopUpsService,
        { provide: getRepositoryToken(BalanceTopUpRequest), useValue: mockRequestRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<BalanceTopUpsService>(BalanceTopUpsService);
    requestRepository = module.get(getRepositoryToken(BalanceTopUpRequest));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a PENDING request with the uploaded proof path', async () => {
      requestRepository.create.mockReturnValue(mockRequest as any);
      requestRepository.save.mockResolvedValue(mockRequest as any);

      const result = await service.create(
        'reseller-uuid-1',
        { amount: 200, note: 'Transferencia USDT' } as any,
        '/uploads/proofs/abc.jpg',
      );

      expect(requestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'reseller-uuid-1',
          amount: 200,
          proof_image_path: '/uploads/proofs/abc.jpg',
          status: BalanceTopUpStatus.PENDING,
        }),
      );
      expect(result).toEqual(mockRequest);
    });
  });

  describe('findOne', () => {
    it('should return a request by uuid', async () => {
      requestRepository.findOne.mockResolvedValue(mockRequest as any);

      const result = await service.findOne('topup-uuid-1');

      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException if the request does not exist', async () => {
      requestRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should credit the balance, record a DEPOSIT transaction and mark the request APPROVED atomically', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...mockRequest })
        .mockResolvedValueOnce({ uuid: 'reseller-uuid-1', balance: 50 });
      (queryRunner.manager.save as jest.Mock).mockImplementation(async (entity) => entity);

      const result: any = await service.approve('topup-uuid-1', 'admin-uuid', 'Verificado');

      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'reseller-uuid-1', balance: 250 }),
      );
      expect(queryRunner.manager.create).toHaveBeenCalledWith(
        Transaction,
        expect.objectContaining({
          user_id: 'reseller-uuid-1',
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount: 200,
          metadata: expect.objectContaining({ topup_request_uuid: mockRequest.uuid }),
        }),
      );
      expect(result.status).toBe(BalanceTopUpStatus.APPROVED);
      expect(result.reviewed_by).toBe('admin-uuid');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if the request does not exist', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.approve('missing-uuid', 'admin-uuid')).rejects.toThrow(NotFoundException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if the request was already reviewed', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockRequest,
        status: BalanceTopUpStatus.APPROVED,
      });

      await expect(service.approve('topup-uuid-1', 'admin-uuid')).rejects.toThrow(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should rollback if crediting the balance fails', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...mockRequest })
        .mockResolvedValueOnce({ uuid: 'reseller-uuid-1', balance: 50 });
      (queryRunner.manager.save as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(service.approve('topup-uuid-1', 'admin-uuid')).rejects.toThrow('DB error');
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should mark the request REJECTED without touching the balance', async () => {
      requestRepository.findOne.mockResolvedValue({ ...mockRequest } as any);
      requestRepository.save.mockImplementation(async (r) => r as any);

      const result: any = await service.reject('topup-uuid-1', 'admin-uuid', 'No coincide el monto');

      expect(result.status).toBe(BalanceTopUpStatus.REJECTED);
      expect(result.reviewed_by).toBe('admin-uuid');
      expect(result.review_note).toBe('No coincide el monto');
    });

    it('should throw BadRequestException if the request was already reviewed', async () => {
      requestRepository.findOne.mockResolvedValue({
        ...mockRequest,
        status: BalanceTopUpStatus.REJECTED,
      } as any);

      await expect(service.reject('topup-uuid-1', 'admin-uuid')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if the request does not exist', async () => {
      requestRepository.findOne.mockResolvedValue(null);

      await expect(service.reject('missing-uuid', 'admin-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
