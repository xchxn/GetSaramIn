import { ApiProperty } from '@nestjs/swagger';

export class QuitDto {
  @ApiProperty({
    description: 'User ID',
    example: 'john.doe',
  })
  id: string;
}
