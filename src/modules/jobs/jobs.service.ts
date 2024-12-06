import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JobsEntity } from 'src/entities/jobs.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { GetJobsDto } from 'src/dto/get-jobs.dto';
import { ApiResponseDto, ErrorCodes } from 'src/dto/api-response.dto';

@Injectable()
export class JobsService {
  constructor(
    @Inject('JOBS_REPOSITORY')
    private readonly jobsRepository: Repository<JobsEntity>,
    private readonly configService: ConfigService,
  ) {}

  // 크롤링
  async crawlingJobs(): Promise<any> {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');

    const page = await browser.newPage();
    
    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setDefaultNavigationTimeout(120000);

    const collectedJobs: JobsEntity[] = [];
    let retryCount = 0;
    const maxRetries = 3;

    try {
      for (let i = 1; i <= 1; i++) {
        const url = `${baseUrl}/job-category?page=2&cat_kewd=84&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle`;
        
        let pageLoaded = false;
        while (!pageLoaded && retryCount < maxRetries) {
          try {
            // First try to navigate to the page
            await page.goto(url, { 
              waitUntil: 'domcontentloaded',  // Changed to only wait for DOM
              timeout: 120000 
            });

            // Then wait for the content to be actually loaded
            try {
              // 페이지가 실제로 사람인 페이지인지 확인
              const isValidPage = await page.evaluate(() => {
                return window.location.href.includes('saramin.co.kr');
              });

              if (!isValidPage) {
                console.warn('Not a valid Saramin page, might be redirected');
                throw new Error('Invalid page');
              }

              // 먼저 company_nm이 있는지 확인 (이는 항상 먼저 로드되는 요소)
              await page.waitForSelector('.company_nm', { timeout: 20000 });
              
              // 그 다음 실제 리스트 아이템을 확인
              await page.waitForSelector('.list_item', { 
                timeout: 10000,
                visible: true 
              });

              // 최소 1개 이상의 항목이 있는지 확인
              const hasItems = await page.evaluate(() => {
                return document.querySelectorAll('.list_item').length > 0;
              });

              if (!hasItems) {
                console.warn('Page loaded but no job listings found');
                throw new Error('No listings');
              }

              pageLoaded = true;
            } catch (selectorError) {
              console.warn(`Job listings not found, retrying... (${retryCount + 1}/${maxRetries})`);
              console.warn(`Error details: ${selectorError.message}`);
              retryCount++;
              if (retryCount >= maxRetries) throw selectorError;
              continue;
            }
          } catch (error) {
            console.error(`Failed to load page ${i}, attempt ${retryCount + 1}:`, error);
            retryCount++;
            if (retryCount >= maxRetries) throw error;
          }
        }

        const jobs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.list_item')).map((element) => {
            // Helper function to safely extract text content
            const getText = (selector: string): string => {
              const el = element.querySelector(selector);
              return el ? el.textContent?.trim() || '' : '';
            };

            // Extract job link
            const jobLink = element.querySelector('.job_tit a');
            const jobUrl = jobLink ? (jobLink as HTMLAnchorElement).href : '';

            // Extract company link
            const companyLink = element.querySelector('.company_nm a');
            const companyUrl = companyLink ? (companyLink as HTMLAnchorElement).href : '';

            // Extract sectors (job categories)
            const sectors = Array.from(element.querySelectorAll('.job_sector span'))
              .map(span => span.textContent?.trim() || '')
              .filter(Boolean)
              .join(', ');

            // Extract deadline and posted date
            const deadlineInfo = element.querySelector('.support_detail .date');
            const postedInfo = element.querySelector('.support_detail .deadlines');

            // Extract job ID from the list item's id attribute
            const jobId = element.id.replace('rec-', '');

            return {
              jobId,
              companyName: getText('.company_nm a'),
              jobTitle: getText('.job_tit a'),
              sectors,
              location: getText('.work_place'),
              career: getText('.career'),
              education: getText('.education'),
              deadline: deadlineInfo ? deadlineInfo.textContent?.trim().replace('~', '') : '',
              postedDate: postedInfo ? postedInfo.textContent?.trim() : '',
              jobUrl,
              companyUrl,
              workType: getText('.career')?.split('·')[1]?.trim() || '',
              updatedAt: new Date().toISOString(),
            };
          });
        });

        const validJobs = jobs.filter(job => job.jobTitle && job.companyName);
        collectedJobs.push(...validJobs.map((job: any) => this.jobsRepository.create(job)));
      }

      console.log('Crawling completed successfully.');

      if (collectedJobs.length > 0) {
        console.log(`Saving ${collectedJobs.length} jobs to database...`);
        await this.jobsRepository.save(collectedJobs);
        console.log('Jobs saved successfully');
      } else {
        console.warn('No jobs were collected during the crawling process');
      }

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

  private validateJobData(job: any): boolean {
    return !!(job.id && job.companyName && job.jobTitle);
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
