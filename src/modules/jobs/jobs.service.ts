import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JobsEntity } from 'src/entities/jobs.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { GetJobsDto } from 'src/dto/get-jobs.dto';
import { ApiResponseDto, ErrorCodes } from 'src/dto/api-response.dto';
import { timeout } from 'rxjs';

@Injectable()
export class JobsService {
  constructor(
    @Inject('JOBS_REPOSITORY')
    private readonly jobsRepository: Repository<JobsEntity>,
    private readonly configService: ConfigService,
  ) { }

  // 크롤링
  async crawlingJobs(): Promise<any> {
    const fs = require('fs');

    const browser = await puppeteer.launch({
      headless: true,
    });
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');

    const page = await browser.newPage();

    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const collectedJobs: JobsEntity[] = [];

    try {
      for (let i = 49488761; i <= 49488860; i++) {
        const url = `${baseUrl}/zf_user/jobs/relay/view?view_type=list&rec_idx=${i}`;

        await page.goto(url);
        // 페이지가 완전히 로드될 때까지 기다림
        await page.waitForSelector('#content', { timeout: 120000 });
        const content = await page.content();
        
        const $ = cheerio.load(content);

        const getTextContent = (selector: string) => {
          return $(selector).text().trim();
        };

        const getHrefContent = (selector: string) => {
          return $(selector).attr('href');
        };

        const id = `${i}`;
        
        const companyName = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.wrap_jv_header > div > div.title_inner > a.company`);
        const companyUrl = getHrefContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.wrap_jv_header > div > div.title_inner > a.company`);
        const title = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.wrap_jv_header > div > h1`);
        const experience = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.jv_cont.jv_summary > div > div:nth-child(1) > dl:nth-child(1) > dd > strong`);
        const education = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.jv_cont.jv_summary > div > div:nth-child(1) > dl:nth-child(2) > dd > strong`);
        const employmentType = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.jv_cont.jv_summary > div > div:nth-child(1) > dl:nth-child(3) > dd > strong`);
        const salary = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.jv_cont.jv_summary > div > div:nth-child(2) > dl:nth-child(1) > dd`);
        const location = getTextContent(`.wrap_jview > section.jview.jview-0-${i} > div.wrap_jv_cont > div.jv_cont.jv_summary > div > div:nth-child(2) > dl:nth-child(2) > dd`);
        
        const metaDescription = $('head > meta:nth-child(7)').attr('content') || '';
        
        console.log({
          id,
          companyName,
          companyUrl,
          title,
          experience,
          education,
          employmentType,
          salary,
          location,
          metaDescription
        });

        if ([experience, education, employmentType, salary, location, companyName].some(value => value)) {
          const jobEntity = new JobsEntity();
          Object.assign(jobEntity, {
            id,
            title,
            experience,
            education,
            employmentType,
            salary,
            location,
            companyName,
            companyUrl,
            metaDescription
          });
          collectedJobs.push(jobEntity);
        }
      }

      await this.saveOptimized(collectedJobs);

      return `Successfully crawled and saved ${collectedJobs.length} jobs`;
    } catch (error) {
      console.error('Crawling error:', error);
      throw new Error(`Crawling failed: ${error.message}`);
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }
  // 크롤링 요청 배치+병렬 전략으로 최적화
  private async saveOptimized(jobs: any[]) {
    const batchSize = 100;
    const concurrentBatches = 3;

    const totalBatches = Math.ceil(jobs.length / batchSize);
    console.log(
      `Starting to process ${jobs.length} jobs in ${totalBatches} batches`,
    );

    for (let i = 0; i < totalBatches; i += concurrentBatches) {
      const batchPromises = [];

      for (let j = 0; j < concurrentBatches && i + j < totalBatches; j++) {
        const start = (i + j) * batchSize;
        const batch = jobs.slice(start, start + batchSize);

        batchPromises.push(
          Promise.all(
            batch.map(async (job) => {
              try {
                const jobEntity = this.jobsRepository.create(job);
                await this.jobsRepository.save(jobEntity);
                console.log(`Saved job ${job.id}`);
              } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                  await this.jobsRepository.update({ id: job.id }, job);
                  console.log(`Updated existing job ${job.id}`);
                } else {
                  console.error(`Error processing job ${job.id}:`, error);
                }
              }
            }),
          ),
        );
      }

      await Promise.all(batchPromises);
      console.log(`Completed batch group ${i / concurrentBatches + 1}`);

      // 다음 배치 그룹 처리 전 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 채용 조회
  async getJobs(getJobsDto: GetJobsDto): Promise<ApiResponseDto<{ data: JobsEntity[]; meta: any }>> {
    try {
      const {
        search,
        keyword,
        company,
        category,
        location,
        experience,
        page = 1,
        limit = 10,
      } = getJobsDto;

      const queryBuilder = this.jobsRepository.createQueryBuilder('job');

      if (search) {
        queryBuilder.where(
          '(job.title ILIKE :search OR job.description ILIKE :search OR job.company ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (keyword) {
        queryBuilder.andWhere('job.title ILIKE :keyword', {
          keyword: `%${keyword}%`,
        });
      }

      if (company) {
        queryBuilder.andWhere('job.company ILIKE :company', {
          company: `%${company}%`,
        });
      }

      if (category) {
        queryBuilder.andWhere('job.category = :category', { category });
      }

      if (location) {
        queryBuilder.andWhere('job.location ILIKE :location', {
          location: `%${location}%`,
        });
      }

      if (experience) {
        queryBuilder.andWhere('job.experience = :experience', { experience });
      }

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      queryBuilder.orderBy('job.createdAt', 'DESC');

      const [jobs, total] = await queryBuilder.getManyAndCount();

      return {
        success: true,
        data: {
          data: jobs,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Failed to fetch jobs'
        }
      };
    }
  }

  // 특정 채용 공고 조회
  async getJobById(id: string): Promise<ApiResponseDto<JobsEntity>> {
    try {
      const job = await this.jobsRepository.findOne({ where: { id } });

      if (!job) {
        return {
          success: false,
          error: {
            code: ErrorCodes.JOB_NOT_FOUND,
            message: `Job with ID ${id} not found`
          }
        };
      }

      // Increment view count
      job.viewCount = (job.viewCount || 0) + 1;
      await this.jobsRepository.save(job);

      return {
        success: true,
        data: job
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Failed to fetch job details'
        }
      };
    }
  }
}
