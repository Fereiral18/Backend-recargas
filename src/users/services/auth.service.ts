import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserStatus, UserRole } from '../../common/enums';

/**
 * Service handling authentication logic
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user in the system
   * @param registerDto - User registration data including email, password, name, and phone
   * @returns Object containing JWT access token and user data (without password)
   * @throws ConflictException if email already exists
   * @example
   * const result = await authService.register({
   *   email: 'user@example.com',
   *   password: 'SecurePass123',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   phone: '+1234567890'
   * });
   */
  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create user object
      const user = this.userRepository.create({
        email: registerDto.email,
        phone: registerDto.phone,
        first_name: registerDto.firstName,
        last_name: registerDto.lastName,
        password_hash: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      // Save user and wait for it to complete
      const savedUser = await this.userRepository.save(user);
      
      // Re-fetch to ensure we have all data
      const freshUser = await this.userRepository.findOne({
        where: { uuid: savedUser.uuid },
      });

      if (!freshUser) {
        throw new Error('Failed to retrieve created user');
      }

      // Generate JWT token
      const payload = { email: freshUser.email, sub: freshUser.uuid, role: freshUser.role };
      const access_token = this.jwtService.sign(payload);

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = freshUser;

      return {
        access_token,
        user: userWithoutPassword,
      };
    } catch (error) {
      // Handle database constraint violations
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        if (error.detail?.includes('phone')) {
          throw new ConflictException('Phone number already exists');
        }
        if (error.detail?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        throw new ConflictException('A user with this information already exists');
      }
      // Re-throw ConflictException as is
      if (error.status === 409) {
        throw error;
      }
      // Log and throw generic error
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user and generate JWT token
   * @param loginDto - User credentials (email and password)
   * @returns Object containing JWT access token and user data
   * @throws UnauthorizedException if credentials are invalid or account is not active
   * @example
   * const result = await authService.login({
   *   email: 'user@example.com',
   *   password: 'SecurePass123'
   * });
   */
  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { email: user.email, sub: user.uuid, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  /**
   * Validate user by UUID (used internally by JWT strategy)
   * @param uuid - User's unique identifier
   * @returns User entity if valid and active
   * @throws NotFoundException if user not found
   * @throws UnauthorizedException if account is not active
   * @internal This method is primarily used by the JWT authentication strategy
   */
  async validateUser(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    return user;
  }
}
