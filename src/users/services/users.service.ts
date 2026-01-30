import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

/**
 * Service for user management
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by UUID
   */
  async findOne(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Update user information
   */
  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Get user dashboard data
   */
  async getDashboard(uuid: string) {
    const user = await this.findOne(uuid);

    // TODO: Aggregate data from related tables
    return {
      balance: user.balance,
      total_recharges: 0,
      pending_recharges: 0,
      total_transactions: 0,
      open_tickets: 0,
    };
  }
}
