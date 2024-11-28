import { Module } from '@nestjs/common';
import { ApplyService } from './apply.service';

@Module({
  providers: [ApplyService]
})
export class ApplyModule {}
