import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums';

export class CreateTransactionDto {
  @ApiProperty({
    example: '010679af-f33c-4c22-8228-c38b46eb9e08',
    description: 'User UUID',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: 'DEPOSIT',
    description: 'Transaction type',
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 100,
    description: 'Transaction amount',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 5,
    description: 'Transaction fee',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fee?: number;

  @ApiProperty({
    example: 'USD',
    description: 'Currency code',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    example: { payment_method: 'credit_card' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
