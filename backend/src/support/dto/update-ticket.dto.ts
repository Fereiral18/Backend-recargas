import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TicketStatus, TicketPriority } from '../../common/enums';

export class UpdateTicketDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'Ticket status',
    enum: TicketStatus,
    required: false,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    example: 'URGENT',
    description: 'Ticket priority',
    enum: TicketPriority,
    required: false,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Admin UUID to assign ticket to',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  assigned_to?: string;
}
