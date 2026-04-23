import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RechargeStatus } from '../../common/enums';

export class UpdateRechargeDto {
  @ApiProperty({
    example: 'COMPLETED',
    description: 'Recharge status',
    enum: RechargeStatus,
    required: false,
  })
  @IsEnum(RechargeStatus)
  @IsOptional()
  status?: RechargeStatus;
}
