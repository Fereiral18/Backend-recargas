import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RechargeType, GameOperator } from '../../common/enums';

export class CreateRechargeDto {
  @ApiProperty({
    example: '010679af-f33c-4c22-8228-c38b46eb9e08',
    description: 'User UUID',
  })
  @IsUUID()
  user_id: string;

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
    example: 50,
    description: 'Recharge amount',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 2.5,
    description: 'Service fee',
  })
  @IsNumber()
  fee: number;
}
