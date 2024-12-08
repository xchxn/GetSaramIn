import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { communityProviders } from './community.providers';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, ...communityProviders],
})
export class CommunityModule {}
