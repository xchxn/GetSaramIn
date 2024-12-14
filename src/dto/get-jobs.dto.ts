import { IsOptional, IsString, IsNumber, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetJobsDto {
  @ApiPropertyOptional({ description: '전체 검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '제목 검색어' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '회사명' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '지역' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '경력' })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({ description: '기술 스택', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stacks?: string[];

  @ApiPropertyOptional({ description: '페이지 번호', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 항목 수', minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}