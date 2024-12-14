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
  @ApiOperation({ 
    summary: '채용 정보 크롤링',
    description: '사람인 사이트에서 채용 정보를 크롤링합니다.'
  })

  @ApiResponse({ 
    status: 200, 
    description: '크롤링 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '12345' },
              title: { type: 'string', example: '백엔드 개발자' },
              companyName: { type: 'string', example: '(주)회사' },
              companyUrl: { type: 'string', example: 'https://example.com' },
              location: { type: 'string', example: '서울 강남구' },
              experience: { type: 'string', example: '신입·경력' },
              education: { type: 'string', example: '학력무관' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: '크롤링 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Internal server error during crawling' }
      }
    }
  })
  @Get('crawl')
  async crawlJobs(): Promise<any> {
    const response = await this.jobsService.crawlingJobs();
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

  @ApiOperation({
    summary: '채용 공고 상세 조회',
    description: '특정 ID의 채용 공고를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '채용 공고 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '12345' },
            title: { type: 'string', example: '백엔드 개발자' },
            companyName: { type: 'string', example: '(주)회사' },
            companyUrl: { type: 'string', example: 'https://example.com' },
            location: { type: 'string', example: '서울 강남구' },
            experience: { type: 'string', example: '신입·경력' },
            education: { type: 'string', example: '학력무관' },
            stacks: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Node.js', 'TypeScript', 'NestJS'] 
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '채용 공고를 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Job with ID 12345 not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
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
