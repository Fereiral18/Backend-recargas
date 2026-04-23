import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../common/enums';

export class UpdateTransactionDto {
  @ApiProperty({
    example: 'COMPLETED',
    description: 'Transaction status',
    enum: TransactionStatus,
    required: false,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
