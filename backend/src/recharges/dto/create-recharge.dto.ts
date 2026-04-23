import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RechargeType, GameOperator } from '../../common/enums';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 2.5,
    description: 'Service fee (optional, calculated automatically if not provided)',
    required: false,
  })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  @IsOptional()
  fee?: number;

  @ApiProperty({
    example: 'SMALL',
    description: 'Diamond package ID (optional, only for Free Fire diamonds)',
    required: false,
  })
  @IsString()
  @IsOptional()
  package?: string;

  @ApiProperty({
    example: 'USDT',
    description: 'Payment currency',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    example: 'Binance',
    description: 'Payment method',
    required: false,
  })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty({
    example: '0x123abc456def',
    description: 'External transaction ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  transaction_id?: string;

  @ApiProperty({
    description: 'Proof image file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  proof_image?: Express.Multer.File;

  @ApiProperty({
    example: '/uploads/proofs/abc123.jpg',
    description: 'Path to proof image (set by server)',
    required: false,
  })
  @IsString()
  @IsOptional()
  proof_image_path?: string;
}
