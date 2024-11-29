import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { jobsProviders } from './jobs.providers';
import { DatabaseModule } from 'src/database/database.module';
@Module({
  imports: [DatabaseModule],
  providers: [...jobsProviders, JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
