import { Inject, Injectable } from '@nestjs/common';
import { CommunityEntity } from 'src/entities/community.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommunityService {
    constructor(
        @Inject('COMMUNITY_REPOSITORY')
        private readonly communityRepository: Repository<CommunityEntity>,
    ) {}

    async getCommunity(): Promise<CommunityEntity[]> {
        return this.communityRepository.find();
    }
}
