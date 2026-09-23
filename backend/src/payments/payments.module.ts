import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { MercadoPagoService } from './services/mercado-pago.service';
import { RechargesModule } from '../recharges/recharges.module';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [RechargesModule, SupplierModule],
  controllers: [PaymentsController],
  providers: [MercadoPagoService],
})
export class PaymentsModule {}
