import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../../common/enums';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Here is my reference number',
    description: 'Message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'USER_MESSAGE',
    description: 'Message type',
    enum: MessageType,
    required: false,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;
}
