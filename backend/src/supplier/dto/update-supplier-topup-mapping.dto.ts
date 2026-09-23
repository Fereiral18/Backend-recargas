import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { GameOperator } from '../../common/enums';

export class UpdateSupplierTopUpMappingDto {
  @ApiProperty({ enum: GameOperator, required: false })
  @IsEnum(GameOperator)
  @IsOptional()
  operator?: GameOperator;

  @ApiProperty({ example: 'SMALL', required: false })
  @IsString()
  @IsOptional()
  package?: string;

  @ApiProperty({ example: 'free-fire', required: false })
  @IsString()
  @IsOptional()
  fzr_category_id?: string;

  @ApiProperty({ example: 'ff_100_diamonds', required: false })
  @IsString()
  @IsOptional()
  fzr_offer_id?: string;

  @ApiProperty({ example: 'player_id', required: false })
  @IsString()
  @IsOptional()
  fzr_player_id_field_key?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
