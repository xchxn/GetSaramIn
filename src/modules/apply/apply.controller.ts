import { Body, Controller, Delete, Get, Post, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ApplicationsDto } from 'src/dto/applications.dto';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { ApplicationsEntity } from 'src/entities/applications.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateApplicationDto } from 'src/dto/create-application.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplyController {
    constructor(private readonly applyService: ApplyService) {}

    @ApiOperation({ summary: 'Submit a new application' })
    @ApiResponse({ status: 201, description: 'Application submitted successfully', type: ApplicationsEntity })
    @ApiResponse({ status: 400, description: 'Bad request - Duplicate application or invalid data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    async apply(@Body() req: CreateApplicationDto): Promise<ApiResponseDto<ApplicationsEntity>> {
        const response = await this.applyService.apply(req);
        if (!response.success) {
            throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
        }
        return response;
    }

    @ApiOperation({ summary: 'Get application history' })
    @ApiResponse({ status: 200, description: 'Returns list of applications', type: [ApplicationsEntity] })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Get()
    async getHistory(@Query() applicationsDto: ApplicationsDto): Promise<ApiResponseDto<ApplicationsEntity[]>> {
        const response = await this.applyService.getHistory(applicationsDto);
        if (!response.success) {
            throw new HttpException(response.error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return response;
    }

    @ApiOperation({ summary: 'Cancel an application' })
    @ApiResponse({ status: 200, description: 'Application cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid application or data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete()
    async cancel(@Body() req: any): Promise<ApiResponseDto<void>> {
        const response = await this.applyService.cancel(req);
        if (!response.success) {
            throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
        }
        return response;
    }
}
