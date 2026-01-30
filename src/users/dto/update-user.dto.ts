import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '../../common/enums';

/**
 * DTO for updating user information
 */
export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: 'USER',
    description: 'User role',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'User status',
    enum: UserStatus,
    required: false,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({
    example: 100.5,
    description: 'User balance',
    required: false,
  })
  @IsOptional()
  balance?: number;
}
