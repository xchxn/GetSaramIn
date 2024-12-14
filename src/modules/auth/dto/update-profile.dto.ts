import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({
    description: 'New username',
    example: 'John Doe Updated',
  })
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'newpassword123',
  })
  @IsString()
  password?: string;
}
