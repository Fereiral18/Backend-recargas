import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargesController } from './controllers/recharges.controller';
import { RechargesService } from './services/recharges.service';
import { Recharge } from './entities/recharge.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { RechargePackage } from './entities/recharge-package.entity';
import { RechargePackagesService } from './services/recharge-packages.service';
import { RechargePackagesController } from './controllers/recharge-packages.controller';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recharge, Transaction, User, RechargePackage]),
    // RechargesController dispara el cumplimiento automático con el
    // proveedor apenas se paga un pedido de revendedor (ver create()) --
    // SupplierModule ya importa RechargesModule, así que esto es circular
    // y necesita forwardRef de los dos lados.
    forwardRef(() => SupplierModule),
  ],
  controllers: [RechargesController, RechargePackagesController],
  providers: [RechargesService, RechargePackagesService],
  exports: [RechargesService, RechargePackagesService],
})
export class RechargesModule {}
