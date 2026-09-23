import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { AuthModule } from './auth.module';

/**
 * Users Module
 * Handles user management
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
