import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionType, TransactionStatus } from '../../common/enums';

/**
 * Service for user management operations
 * Handles user profile retrieval, updates, and dashboard data
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Find all users with optional filters (admin only)
   * @param filters - Optional filters for role, status, search, pagination
   * @returns Array of users without password hashes and total count
   */
  async findAll(filters: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { role, status, search, page = 1, limit = 20 } = filters;
    
    const query = this.userRepository.createQueryBuilder('user');
    
    if (role) {
      query.andWhere('user.role = :role', { role });
    }
    
    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const [users, total] = await query
      .select([
        'user.uuid',
        'user.email',
        'user.phone',
        'user.first_name',
        'user.last_name',
        'user.role',
        'user.status',
        'user.balance',
        'user.last_login',
        'user.email_verified',
        'user.created_at',
      ])
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total, page, limit };
  }

  /**
   * Get total count of users
   */
  async count(): Promise<number> {
    return this.userRepository.count();
  }

  /**
   * Find a user by their UUID
   * @param uuid - User's unique identifier
   * @returns User entity without password hash
   * @throws NotFoundException if user not found
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
   * Update user profile information
   * @param uuid - User's unique identifier
   * @param updateUserDto - Fields to update (name, phone, etc.)
   * @returns Updated user entity without password hash
   * @throws NotFoundException if user not found
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
   * Update a user's role, status or reseller tier (admin only).
   * Balance is never touched here — it only moves through creditBalance()
   * so every change leaves an auditable Transaction.
   * @param uuid - User's unique identifier
   * @param updateUserDto - Fields to update
   * @returns Updated user entity without password hash
   * @throws NotFoundException if user not found
   */
  async updateAsAdmin(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { balance, ...allowedChanges } = updateUserDto;
    Object.assign(user, allowedChanges);
    await this.userRepository.save(user);

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Credit a reseller's prepaid balance (e.g. after receiving USDT off-platform)
   * and record a matching DEPOSIT transaction for the audit trail.
   * @param uuid - User's unique identifier
   * @param amount - Positive amount to add to the balance (USD)
   * @param note - Optional free-text note (e.g. payment reference)
   * @returns Updated user entity without password hash
   * @throws NotFoundException if user not found
   */
  async creditBalance(uuid: string, amount: number, note?: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Incremento atómico en SQL (balance = balance + x) en vez de
    // leer-modificar-escribir, para no pisar un débito concurrente.
    await this.userRepository.increment({ uuid }, 'balance', amount);
    user.balance = parseFloat((Number(user.balance) + amount).toFixed(2));

    const transaction = this.transactionRepository.create({
      user_id: user.uuid,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount,
      fee: 0,
      net_amount: amount,
      reference: `TXN-CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currency: 'USD',
      metadata: note ? { note } : undefined,
      completed_at: new Date(),
    });
    await this.transactionRepository.save(transaction);

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Get user dashboard data with statistics
   * @param uuid - User's unique identifier
   * @returns Dashboard data including balance and activity statistics
   * @example
   * const dashboard = await usersService.getDashboard('uuid-123');
   * // Returns: { balance: 1000, total_recharges: 5, pending_recharges: 1, ... }
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
