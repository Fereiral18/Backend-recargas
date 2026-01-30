import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/**
 * Controller for user management
 */

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    // Users can't change their own role or status
    delete updateUserDto.role;
    delete updateUserDto.status;
    delete updateUserDto.balance;

    const user = await this.usersService.update(req.user.uuid, updateUserDto);

    return {
      message: 'Profile updated successfully',
      data: user,
    };
  }
}
