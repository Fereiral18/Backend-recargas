import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SupplierTopUpMappingsService } from './supplier-topup-mappings.service';
import { SupplierTopUpMapping } from '../entities/supplier-topup-mapping.entity';
import { GameOperator } from '../../common/enums';

describe('SupplierTopUpMappingsService', () => {
  let service: SupplierTopUpMappingsService;
  let repository: jest.Mocked<Repository<SupplierTopUpMapping>>;

  const mockMapping = {
    uuid: 'mapping-uuid-1',
    operator: GameOperator.FREE_FIRE,
    package: 'SMALL',
    fzr_category_id: 'free-fire',
    fzr_offer_id: 'ff_100_diamonds',
    fzr_player_id_field_key: 'player_id',
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
        SupplierTopUpMappingsService,
        { provide: getRepositoryToken(SupplierTopUpMapping), useValue: mockRepository },
      ],
    }).compile();

    service = module.get(SupplierTopUpMappingsService);
    repository = module.get(getRepositoryToken(SupplierTopUpMapping));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if the mapping does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMapping', () => {
    it('should return the exact (operator, package) mapping when one exists', async () => {
      repository.findOne.mockResolvedValueOnce(mockMapping as any);

      const result = await service.findMapping(GameOperator.FREE_FIRE, 'SMALL');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { operator: GameOperator.FREE_FIRE, package: 'SMALL', active: true },
      });
      expect(result).toEqual(mockMapping);
    });

    it('should fall back to the package-less default mapping when no exact match exists', async () => {
      repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        ...mockMapping,
        package: null,
      } as any);

      const result = await service.findMapping(GameOperator.FREE_FIRE, 'BIGGER');

      expect(repository.findOne).toHaveBeenNthCalledWith(2, {
        where: { operator: GameOperator.FREE_FIRE, package: IsNull(), active: true },
      });
      expect(result).toEqual(expect.objectContaining({ package: null }));
    });

    it('should go straight to the default mapping when no package was given', async () => {
      repository.findOne.mockResolvedValueOnce({ ...mockMapping, package: null } as any);

      await service.findMapping(GameOperator.FREE_FIRE, undefined);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { operator: GameOperator.FREE_FIRE, package: IsNull(), active: true },
      });
    });

    it('should return undefined when nothing matches', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findMapping(GameOperator.FORTNITE, 'X');

      expect(result).toBeNull();
    });
  });
});
