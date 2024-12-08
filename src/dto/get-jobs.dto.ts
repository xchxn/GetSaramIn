import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetJobsDto {
  @ApiPropertyOptional({ description: 'Search term for jobs' })
  readonly search?: string;

  @ApiPropertyOptional({ description: 'Keyword to filter jobs' })
  readonly keyword?: string;

  @ApiPropertyOptional({ description: 'Company name to filter jobs' })
  readonly company?: string;

  @ApiPropertyOptional({ description: 'Job category' })
  readonly category?: string;

  @ApiPropertyOptional({ description: 'Job location' })
  readonly location?: string;

  @ApiPropertyOptional({ description: 'Required experience level' })
  readonly experience?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  readonly page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  readonly limit?: number;

  @ApiPropertyOptional({ description: 'Number of views for the job' })
  readonly viewCount?: number;
}
