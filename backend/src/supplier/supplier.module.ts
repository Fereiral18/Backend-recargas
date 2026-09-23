import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierTopUpMapping } from './entities/supplier-topup-mapping.entity';
import { FzrCardsService } from './services/fzr-cards.service';
import { SupplierTopUpMappingsService } from './services/supplier-topup-mappings.service';
import { SupplierFulfillmentService } from './services/supplier-fulfillment.service';
import { SupplierCatalogController } from './controllers/supplier-catalog.controller';
import { SupplierTopUpMappingsController } from './controllers/supplier-topup-mappings.controller';
import { SupplierWebhookController } from './controllers/supplier-webhook.controller';
import { RechargesModule } from '../recharges/recharges.module';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierTopUpMapping]), forwardRef(() => RechargesModule)],
  controllers: [SupplierCatalogController, SupplierTopUpMappingsController, SupplierWebhookController],
  providers: [FzrCardsService, SupplierTopUpMappingsService, SupplierFulfillmentService],
  exports: [SupplierFulfillmentService],
})
export class SupplierModule {}
