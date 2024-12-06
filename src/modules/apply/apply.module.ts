import { Module } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { applyProviders } from './apply.providers';
import { ApplyController } from './apply.controller';

@Module({
  providers: [ApplyService, ...applyProviders],
  controllers: [ApplyController],
})
export class ApplyModule {}
