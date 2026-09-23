import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsPositive, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { GameOperator, RechargeType } from '../../common/enums';

export class UpdateRechargePackageDto {
  @ApiProperty({ enum: GameOperator, required: false })
  @IsEnum(GameOperator)
  @IsOptional()
  operator?: GameOperator;

  @ApiProperty({ example: 'SMALL', required: false })
  @IsString()
  @IsOptional()
  package?: string;

  @ApiProperty({ enum: RechargeType, required: false })
  @IsEnum(RechargeType)
  @IsOptional()
  type?: RechargeType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  diamonds?: number;

  @ApiProperty({ required: false, description: 'Final B2C sale price, in ARS' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  b2c_price_ars?: number;

  @ApiProperty({ required: false, description: 'Reseller price, in USD' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  reseller_price_usd?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
