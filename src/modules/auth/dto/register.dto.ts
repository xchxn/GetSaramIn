import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'John Doe',
  })
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  password: string;
}
