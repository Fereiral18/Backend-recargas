import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { UsersModule } from './users/users.module';
import { RechargesModule } from './recharges/recharges.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SupportModule } from './support/support.module';
import { ResellersModule } from './resellers/resellers.module';
import { PaymentsModule } from './payments/payments.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath:'.env' }),
    // Límite general por IP: 120 requests por minuto. Los endpoints sensibles
    // (login/register) tienen su propio límite más estricto con @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    CoreModule,
    UsersModule,
    RechargesModule,
    TransactionsModule,
    SupportModule,
    ResellersModule,
    PaymentsModule,
    SupplierModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
