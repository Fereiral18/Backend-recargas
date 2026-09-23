import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for user registration
 */
export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

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
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (8-72 characters)',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  // bcrypt only uses the first 72 bytes: anything past that is silently ignored.
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  password: string;
}
