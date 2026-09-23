import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, MinLength, IsOptional } from 'class-validator';

export class UpdateResellerTierDto {
  @ApiProperty({ example: 'Bronce', description: 'Tier name', required: false })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 500,
    description: 'Minimum cumulative USD volume required for this tier',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_volume_usd?: number;
}
