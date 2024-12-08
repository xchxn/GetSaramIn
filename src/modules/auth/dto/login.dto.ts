import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  id: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  password: string;
}
