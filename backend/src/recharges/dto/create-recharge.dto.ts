import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RechargeType, GameOperator, RechargeModality } from '../../common/enums';

export class CreateRechargeDto {
  @ApiProperty({
    example: 'DIAMONDS',
    description: 'Type of recharge',
    enum: RechargeType,
  })
  @IsEnum(RechargeType)
  type: RechargeType;

  @ApiProperty({
    example: '1234567890',
    description: 'Player ID in the game',
  })
  @IsString()
  phone_number: string; // Player ID

  @ApiProperty({
    example: 'FREE_FIRE',
    description: 'Game operator',
    enum: GameOperator,
  })
  @IsEnum(GameOperator)
  operator: GameOperator;

  @ApiProperty({
    example: 'DIRECT',
    description: 'Fulfillment modality: direct top-up or gift card (resellers only, defaults to DIRECT)',
    enum: RechargeModality,
    required: false,
  })
  @IsEnum(RechargeModality)
  @IsOptional()
  modality?: RechargeModality;

  @ApiProperty({
    example: 'SMALL',
    description: 'Package key from the sale-price catalog (GET /recharge-packages) — the price is looked up server-side from it, never from the client',
  })
  @IsString()
  package: string;
}
