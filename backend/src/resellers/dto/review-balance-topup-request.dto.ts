import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReviewBalanceTopUpRequestDto {
  @ApiProperty({
    example: 'Verificado contra el resumen de cuenta del 19/09',
    description: 'Free-text note explaining the approval/rejection (recommended for rejections)',
    required: false,
  })
  @IsOptional()
  @IsString()
  review_note?: string;
}
