import { Body, Controller, Delete, Get, Post, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ApplicationsDto } from 'src/dto/applications.dto';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { ApplicationsEntity } from 'src/entities/applications.entity';

@Controller('applications')
export class ApplyController {
    constructor(private readonly applyService: ApplyService) {
        
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async apply(@Body() req: any): Promise<ApiResponseDto<ApplicationsEntity>> {
        const response = await this.applyService.apply(req);
        if (!response.success) {
            throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
        }
        return response;
    }

    @Get()
    async getHistory(@Query() applicationsDto: ApplicationsDto): Promise<ApiResponseDto<ApplicationsEntity[]>> {
        const response = await this.applyService.getHistory(applicationsDto);
        if (!response.success) {
            throw new HttpException(response.error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return response;
    }

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
