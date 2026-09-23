import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { GameOperator } from '../../common/enums';

export class CreateSupplierTopUpMappingDto {
  @ApiProperty({ enum: GameOperator, example: GameOperator.FREE_FIRE })
  @IsEnum(GameOperator)
  operator: GameOperator;

  @ApiProperty({ example: 'SMALL', required: false, description: 'Matches Recharge.package, if used' })
  @IsString()
  @IsOptional()
  package?: string;

  @ApiProperty({ example: 'free-fire', description: 'category_id from GET /api/v2/topups' })
  @IsString()
  fzr_category_id: string;

  @ApiProperty({ example: 'ff_100_diamonds', description: 'offer_id from GET /api/v2/topups/offers' })
  @IsString()
  fzr_offer_id: string;

  @ApiProperty({
    example: 'player_id',
    description: "Key inside FZR's offer `fields` that receives our phone_number/Player ID",
  })
  @IsString()
  fzr_player_id_field_key: string;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
