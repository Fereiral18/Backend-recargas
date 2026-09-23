import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBalanceTopUpRequestDto {
  @ApiProperty({
    example: 200,
    description: 'Amount transferred off-platform, to be credited to the balance (USD)',
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Transferencia USDT TRC20, TXID 0xabc...',
    description: 'Free-text reference for the transfer (bank, wallet, TXID, etc.)',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'Proof of the transfer (screenshot/receipt)',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  proof_image?: Express.Multer.File;
}
