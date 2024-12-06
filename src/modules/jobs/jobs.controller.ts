import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GetJobsDto } from 'src/dto/get-jobs.dto';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { JobsEntity } from 'src/entities/jobs.entity';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('crawl')
  async crawlJobs(): Promise<ApiResponseDto<JobsEntity[]>> {
    const response = await this.jobsService.crawlingJobs();
    if (!response.success) {
      throw new HttpException(response.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response;
  }

  @Get()
  async getJobs(@Query() getJobsDto: GetJobsDto): Promise<ApiResponseDto<{ data: JobsEntity[]; meta: any }>> {
    const response = await this.jobsService.getJobs(getJobsDto);
    if (!response.success) {
      throw new HttpException(response.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response;
  }

  @Get(':id')
  async getJobById(@Param('id') id: string): Promise<ApiResponseDto<JobsEntity>> {
    const response = await this.jobsService.getJobById(id);
    if (!response.success) {
      throw new HttpException(
        response.error,
        response.error.code === 'JOB_NOT_FOUND' ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return response;
  }
}
