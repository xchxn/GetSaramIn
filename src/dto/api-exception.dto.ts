import { ApiProperty } from '@nestjs/swagger';

export class ApiExceptionDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'Error message description' })
    message: string;

    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: 'BAD_REQUEST' })
    error: string;
}
