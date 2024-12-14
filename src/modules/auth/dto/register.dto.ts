import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  @IsString()
  id: string;

  
  @ApiProperty({
    description: 'Username',
    example: 'John Doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsString()
  password: string;
}
