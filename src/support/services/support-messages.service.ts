import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportMessage } from '../entities/support-message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class SupportMessagesService {
  constructor(
    @InjectRepository(SupportMessage)
    private readonly messageRepository: Repository<SupportMessage>,
  ) {}

  async create(
    ticket_id: string,
    user_id: string,
    createMessageDto: CreateMessageDto,
  ) {
    const message = this.messageRepository.create({
      ticket_id,
      user_id,
      ...createMessageDto,
    });

    return this.messageRepository.save(message);
  }

  async findByTicket(ticket_id: string) {
    return this.messageRepository.find({
      where: { ticket_id },
      order: { created_at: 'ASC' },
    });
  }

  async markAsRead(uuid: string) {
    const message = await this.messageRepository.findOne({ where: { uuid } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.is_read = true;
    return this.messageRepository.save(message);
  }
}
