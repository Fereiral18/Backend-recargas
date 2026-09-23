import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: jest.Mocked<Pick<Repository<User>, 'findOne'>>;

  const payload = { sub: 'user-uuid-1', email: 'user@example.com', role: UserRole.ADMIN };

  beforeEach(() => {
    const configService = { get: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;
    userRepository = { findOne: jest.fn() };
    strategy = new JwtStrategy(configService, userRepository as unknown as Repository<User>);
  });

  it('should take the role from the DB, not from the token payload', async () => {
    // Token says admin, but the user was demoted to a regular user since.
    userRepository.findOne.mockResolvedValue({
      uuid: 'user-uuid-1',
      email: 'user@example.com',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    } as User);

    await expect(strategy.validate(payload)).resolves.toEqual({
      uuid: 'user-uuid-1',
      email: 'user@example.com',
      role: UserRole.USER,
    });
  });

  it('should reject a token whose user is no longer active', async () => {
    userRepository.findOne.mockResolvedValue({
      uuid: 'user-uuid-1',
      email: 'user@example.com',
      role: UserRole.USER,
      status: UserStatus.BANNED,
    } as User);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a token whose user no longer exists', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
