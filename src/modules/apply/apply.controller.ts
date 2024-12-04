import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('applications')
export class ApplyController {
    constructor(private readonly applyService: ApplyService) {
        
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async apply(@Body() req: any): Promise<any> {
        return this.applyService.apply(req);
    }

    @Get()
    async getHistory(): Promise<any> {
        return this.applyService.getHistory();
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async cancel(@Body() req: any): Promise<any> {
        return this.applyService.cancel(req);
    }
}
