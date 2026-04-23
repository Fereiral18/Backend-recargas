import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TicketPriority } from '../../common/enums';

/**
 * DTO for creating a support ticket
 */
export class CreateTicketDto {
  @ApiProperty({
    example: 'Recharge not received',
    description: 'Ticket subject',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'I made a recharge 1 hour ago and have not received it yet',
    description: 'Detailed description of the issue',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'RECHARGE_ISSUE',
    description: 'Ticket category',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 'HIGH',
    description: 'Ticket priority',
    enum: TicketPriority,
    required: false,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;
}
