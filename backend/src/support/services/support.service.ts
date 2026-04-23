import { Injectable } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { SupportMessagesService } from './support-messages.service';

@Injectable()
export class SupportService {
  constructor(
    private readonly ticketsService: SupportTicketsService,
    private readonly messagesService: SupportMessagesService,
  ) {}

  // Additional support-related logic can go here
}
