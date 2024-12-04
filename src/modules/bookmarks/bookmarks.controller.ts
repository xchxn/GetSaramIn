import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('bookmarks')
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) {

    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() req: any): Promise<any> {
        return await this.bookmarksService.create(req);
    }

    @Get()
    async getList(): Promise<any> {
        return await this.bookmarksService.getList();
    }
}
