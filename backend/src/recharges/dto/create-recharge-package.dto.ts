import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsPositive, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { GameOperator, RechargeType } from '../../common/enums';

export class CreateRechargePackageDto {
  @ApiProperty({ enum: GameOperator, example: GameOperator.FREE_FIRE })
  @IsEnum(GameOperator)
  operator: GameOperator;

  @ApiProperty({ example: 'SMALL', description: "Package key, matches Recharge.package" })
  @IsString()
  package: string;

  @ApiProperty({ enum: RechargeType, example: RechargeType.DIAMONDS })
  @IsEnum(RechargeType)
  type: RechargeType;

  @ApiProperty({ example: '100 + 10 diamantes' })
  @IsString()
  name: string;

  @ApiProperty({ example: 110, required: false, description: 'Total diamonds granted, for display' })
  @IsInt()
  @IsOptional()
  diamonds?: number;

  @ApiProperty({ example: 1500, description: 'Final B2C sale price, in ARS' })
  @IsNumber()
  @IsPositive()
  b2c_price_ars: number;

  @ApiProperty({ example: 0.9, description: "Reseller price, in USD (debited from their balance)" })
  @IsNumber()
  @IsPositive()
  reseller_price_usd: number;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
