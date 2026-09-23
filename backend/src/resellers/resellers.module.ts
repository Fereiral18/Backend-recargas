import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResellerTiersController } from './controllers/reseller-tiers.controller';
import { ResellerTiersService } from './services/reseller-tiers.service';
import { ResellerTier } from './entities/reseller-tier.entity';
import { BalanceTopUpsController } from './controllers/balance-topups.controller';
import { BalanceTopUpsService } from './services/balance-topups.service';
import { BalanceTopUpRequest } from './entities/balance-topup-request.entity';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResellerTier, BalanceTopUpRequest, User, Transaction])],
  controllers: [ResellerTiersController, BalanceTopUpsController],
  providers: [ResellerTiersService, BalanceTopUpsService],
  exports: [ResellerTiersService, BalanceTopUpsService],
})
export class ResellersModule {}
