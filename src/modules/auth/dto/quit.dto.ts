import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QuitDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  @IsString()
  id: string;
}
