import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'New username',
    example: 'John Doe Updated',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'newpassword123',
  })
  password?: string;
}
