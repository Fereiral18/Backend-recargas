import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreditBalanceDto } from '../dto/credit-balance.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserRole } from '../../common/enums';

/**
 * Controller for user management
 */

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Solo admins pueden listar usuarios
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden ver la lista de usuarios');
    }

    const result = await this.usersService.findAll({ role, status, search, page, limit });

    return {
      message: 'Users retrieved successfully',
      data: result.users,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics' })
  async getStats(@Request() req: AuthenticatedRequest) {
    // Solo admins pueden ver estadísticas
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden ver estadísticas');
    }

    const totalUsers = await this.usersService.count();

    return {
      message: 'Stats retrieved successfully',
      data: {
        total: totalUsers,
      },
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOne(req.user.uuid);

    return {
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get user dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboard(@Request() req: AuthenticatedRequest) {
    const dashboard = await this.usersService.getDashboard(req.user.uuid);

    return {
      message: 'Dashboard data retrieved successfully',
      data: dashboard,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Users can't change their own role, status, balance or reseller tier
    delete updateUserDto.role;
    delete updateUserDto.status;
    delete updateUserDto.balance;
    delete updateUserDto.tier_id;

    const user = await this.usersService.update(req.user.uuid, updateUserDto);

    return {
      message: 'Profile updated successfully',
      data: user,
    };
  }

  // Rutas con :uuid van al final: en Nest/Express matchean por orden de
  // declaración, así que si fueran antes de 'me'/'stats'/'dashboard'
  // interceptarían esas rutas literales tratando el literal como uuid.
  @Patch(':uuid')
  @ApiOperation({ summary: "Update a user's role, status or reseller tier (admin only)" })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateAsAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden editar otros usuarios');
    }

    const user = await this.usersService.updateAsAdmin(uuid, updateUserDto);

    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @Post(':uuid/balance/credit')
  @ApiOperation({ summary: "Credit a reseller's prepaid balance (admin only)" })
  @ApiResponse({ status: 200, description: 'Balance credited successfully' })
  async creditBalance(
    @Request() req: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() creditBalanceDto: CreditBalanceDto,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden acreditar saldo');
    }

    const user = await this.usersService.creditBalance(
      uuid,
      creditBalanceDto.amount,
      creditBalanceDto.note,
    );

    return {
      message: 'Balance credited successfully',
      data: user,
    };
  }
}
