import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargesController } from './controllers/recharges.controller';
import { RechargesService } from './services/recharges.service';
import { Recharge } from './entities/recharge.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recharge, User])],
  controllers: [RechargesController],
  providers: [RechargesService],
  exports: [RechargesService],
})
export class RechargesModule {}
