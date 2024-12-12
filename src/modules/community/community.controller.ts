import { Controller, Get, Query } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityEntity } from 'src/entities/community.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
    constructor(
        private readonly communityService: CommunityService
    ) {}

    @ApiOperation({ summary: 'Crawl community posts' })
    @ApiResponse({ status: 200, description: 'Successfully crawled community posts' })
    @ApiQuery({ name: 'startIdx', required: true, description: 'Start index for crawling', type: 'number' })
    @ApiQuery({ name: 'endIdx', required: true, description: 'End index for crawling', type: 'number' })
    @Get('crawl')
    async getCommunity(@Query() query: { startIdx: number, endIdx: number }): Promise<any> {
        return this.communityService.getCommunity(query.startIdx, query.endIdx);
    }

    @ApiOperation({ summary: 'Get list of community posts' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved posts list', type: CommunityEntity, isArray: true })
    @Get('list')
    async getPostList(): Promise<CommunityEntity[]> {
        return this.communityService.getPostList();
    }

    @ApiOperation({ summary: 'Get community post by ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved post', type: CommunityEntity })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @ApiQuery({ name: 'id', required: true, description: 'Post ID', type: 'number' })
    @Get(':id')
    async getPostById(@Query('id') id: number): Promise<CommunityEntity> {
        return this.communityService.getPostById(id);
    }
}
