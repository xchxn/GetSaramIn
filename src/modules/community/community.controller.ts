import { Controller, Get, Query } from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
    constructor(
        private readonly communityService: CommunityService
    ) {}

    @Get()
    async getCommunity(@Query() query: { startIdx: number, endIdx: number }): Promise<any> {
        return this.communityService.getCommunity(query.startIdx, query.endIdx);
    }
}
