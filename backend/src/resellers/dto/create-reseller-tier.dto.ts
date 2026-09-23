import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, MinLength } from 'class-validator';

export class CreateResellerTierDto {
  @ApiProperty({ example: 'Bronce', description: 'Tier name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 500, description: 'Minimum cumulative USD volume required for this tier' })
  @IsNumber()
  @Min(0)
  min_volume_usd: number;
}
