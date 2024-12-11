import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GetJobsDto } from 'src/dto/get-jobs.dto';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { JobsEntity } from 'src/entities/jobs.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Crawl jobs from external sources' })
  @ApiResponse({ 
    status: 200, 
    description: 'Jobs crawled successfully',
    type: JobsEntity,
    isArray: true 
  })
  @ApiResponse({ status: 500, description: 'Internal server error during crawling' })
  @Get('crawl')
  async crawlJobs(): Promise<any> {
    const response = await this.jobsService.crawlingJobs();
    if (!response.success) {
      throw new HttpException(response.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response;
  }

  @ApiOperation({ summary: 'Get all jobs with filtering options' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for jobs' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Keyword to filter jobs' })
  @ApiQuery({ name: 'company', required: false, description: 'Company name to filter jobs' })
  @ApiQuery({ name: 'category', required: false, description: 'Job category' })
  @ApiQuery({ name: 'location', required: false, description: 'Job location' })
  @ApiQuery({ name: 'experience', required: false, description: 'Required experience level' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully',
    type: JobsEntity,
    isArray: true
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async getJobs(@Query() getJobsDto: GetJobsDto): Promise<ApiResponseDto<{ data: JobsEntity[]; meta: any }>> {
    const response = await this.jobsService.getJobs(getJobsDto);
    if (!response.success) {
      throw new HttpException(response.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response;
  }

  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job found successfully',
    type: JobsEntity
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
