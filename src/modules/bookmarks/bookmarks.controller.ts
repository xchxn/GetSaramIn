import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('bookmarks')
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) {

    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async setBookmark(@Body() req: any): Promise<any> {
        return await this.bookmarksService.setBookmark(req, req.user.id);
    }

    @Get()
    async getList(@Query() req: any): Promise<any> {
        return await this.bookmarksService.getList(req);
    }
}
