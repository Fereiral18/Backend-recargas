import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicketsController } from './controllers/support-tickets.controller';
import { SupportMessagesController } from './controllers/support-messages.controller';
import { SupportController } from './controllers/support.controller';
import { SupportTicketsService } from './services/support-tickets.service';
import { SupportMessagesService } from './services/support-messages.service';
import { SupportService } from './services/support.service';
import { SupportTicket } from './entities/support-ticket.entity';
import { SupportMessage } from './entities/support-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket, SupportMessage])],
  controllers: [
    SupportController,
    SupportTicketsController,
    SupportMessagesController,
  ],
  providers: [SupportService, SupportTicketsService, SupportMessagesService],
  exports: [SupportService],
})
export class SupportModule {}
