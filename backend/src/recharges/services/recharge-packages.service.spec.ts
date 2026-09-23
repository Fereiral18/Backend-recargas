import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RechargePackagesService } from './recharge-packages.service';
import { RechargePackage } from '../entities/recharge-package.entity';
import { GameOperator, RechargeType } from '../../common/enums';

describe('RechargePackagesService', () => {
  let service: RechargePackagesService;
  let repository: jest.Mocked<Repository<RechargePackage>>;

  const mockPackage = {
    uuid: 'pkg-uuid-1',
    operator: GameOperator.FREE_FIRE,
    package: 'SMALL',
    type: RechargeType.DIAMONDS,
    name: '100 + 10 diamantes',
    b2c_price_ars: 1500,
    reseller_price_usd: 0.9,
    active: true,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RechargePackagesService,
        { provide: getRepositoryToken(RechargePackage), useValue: mockRepository },
      ],
    }).compile();

    service = module.get(RechargePackagesService);
    repository = module.get(getRepositoryToken(RechargePackage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if the package does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findForPurchase', () => {
    it('should only match active packages for the given operator/package', async () => {
      repository.findOne.mockResolvedValue(mockPackage as any);

      const result = await service.findForPurchase(GameOperator.FREE_FIRE, 'SMALL');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { operator: GameOperator.FREE_FIRE, package: 'SMALL', active: true },
      });
      expect(result).toEqual(mockPackage);
    });

    it('should return null (never throw) when nothing matches', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findForPurchase(GameOperator.FORTNITE, 'UNKNOWN');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should filter by operator when given', async () => {
      repository.find.mockResolvedValue([mockPackage] as any);

      await service.findAll(GameOperator.FREE_FIRE);

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { operator: GameOperator.FREE_FIRE } }),
      );
    });

    it('should list every package when no operator is given', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    });
  });

  describe('update', () => {
    it('should merge the changes and save', async () => {
      repository.findOne.mockResolvedValue({ ...mockPackage } as any);
      repository.save.mockImplementation(async (p) => p as any);

      const result: any = await service.update('pkg-uuid-1', { b2c_price_ars: 1800 } as any);

      expect(result.b2c_price_ars).toBe(1800);
    });
  });

  describe('remove', () => {
    it('should remove an existing package', async () => {
      repository.findOne.mockResolvedValue({ ...mockPackage } as any);

      await service.remove('pkg-uuid-1');

      expect(repository.remove).toHaveBeenCalledWith(expect.objectContaining({ uuid: 'pkg-uuid-1' }));
    });
  });
});
