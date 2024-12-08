import { IsString, IsEmail, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
    @ApiProperty({ description: 'User ID of the applicant' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'Email address of the applicant' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Full name of the applicant' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Phone number of the applicant' })
    @IsString()
    phone: string;

    @ApiProperty({ description: 'URL or path to the resume file', required: false })
    @IsString()
    @IsOptional()
    resume?: string;

    @ApiProperty({ description: 'URL or path to the cover letter file', required: false })
    @IsString()
    @IsOptional()
    coverLetter?: string;

    @ApiProperty({ description: 'URL or path to the portfolio', required: false })
    @IsString()
    @IsOptional()
    portfolio?: string;
}
