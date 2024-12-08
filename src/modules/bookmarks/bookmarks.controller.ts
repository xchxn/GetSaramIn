import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { PaginationDto } from 'src/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookmarksEntity } from 'src/entities/bookmark.entity';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) {}

    @ApiOperation({ summary: 'Set or remove bookmark' })
    @ApiResponse({ status: 200, description: 'Bookmark set or removed successfully', type: BookmarksEntity })
    @UseGuards(JwtAuthGuard)
    @Post()
    async setBookmark(
        @Body('id') id: string,
        @Body('userId') userId: string
    ): Promise<BookmarksEntity | null> {
        return await this.bookmarksService.setBookmark(userId, id);
    }

    @ApiOperation({ summary: 'Get bookmarked items with pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated list of bookmarks', type: [BookmarksEntity] })
    @Get()
    async getList(
        @Query('userId') userId: string,
        @Query() pagination: PaginationDto
    ): Promise<{ items: BookmarksEntity[], total: number }> {
        return await this.bookmarksService.getList(userId, pagination);
    }
}
