import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('get')
  async getJobs(): Promise<any> {
    return this.jobsService.getJobs();
  }
}
