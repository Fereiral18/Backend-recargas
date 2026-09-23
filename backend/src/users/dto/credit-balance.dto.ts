import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class CreditBalanceDto {
  @ApiProperty({ example: 100, description: 'Amount to credit to the reseller balance (USD)' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'USDT recibido por Binance, TXID 0xabc...',
    description: 'Free-text note for the audit trail',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
