import { Controller, Get, Query, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GetJobsDto } from 'src/dto/get-jobs.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('crawling')
  async crawlingJobs(): Promise<any> {
    return this.jobsService.crawlingJobs();
  }

  @Get('jobs')
  async getJobs(@Query() getJobsDto: GetJobsDto): Promise<any> {
    return this.jobsService.getJobs(getJobsDto);
  }

  @Get('jobs/:id')
  async getJobById(@Param('id') id: string): Promise<any> {
    return this.jobsService.getJobById(id);
  }
}
