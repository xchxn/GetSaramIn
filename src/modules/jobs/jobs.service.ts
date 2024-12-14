import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JobsEntity } from 'src/entities/jobs.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GetJobsDto } from 'src/dto/get-jobs.dto';
import { ApiResponseDto, ErrorCodes } from 'src/dto/api-response.dto';

@Injectable()
export class JobsService {
  constructor(
    @Inject('JOBS_REPOSITORY')
    private readonly jobsRepository: Repository<JobsEntity>,
    private readonly configService: ConfigService,
  ) { }

  // 크롤링
  async crawlingJobs(): Promise<any> {
    const puppeteer = require('puppeteer');
    const cheerio = require('cheerio');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');

    console.log(baseUrl);

    const page = await browser.newPage();
    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
    // Set default timeout
    page.setDefaultNavigationTimeout(240000); // 60초로 타임아웃 증가
    page.setDefaultTimeout(240000);

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setCacheEnabled(false);

    const url = `${baseUrl}/zf_user/jobs/list/job-category?cat_mcls=2&panel_type=&search_optional_item=n&search_done=y&panel_count=y&preview=y&page=1&page_count=100`;
    // const url = `${baseUrl}/zf_user/jobs/list/job-category?cat_kewd=81&tab_type=default&panel_type=&search_optional_item=n&search_done=n&panel_count=n&smart_tag=&page=1&page_count=100`;
    try {
      console.log('start crawling',url);

      await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 0
      });

      // 특정 요소가 로드될 때까지 기다림
      await page.waitForSelector('#default_list_wrap > section > div', { timeout: 0 });

      const content = await page.content();

      const $ = cheerio.load(content);

      // 페이지 HTML 구조 확인을 위한 로깅
      console.log('Page title:', $('title').text());

      // Find all div elements that have an ID starting with 'rec-'
      const elements = $('div[id^="rec-"]');

      console.log('Found job listings:', elements.length);

      elements.each((index: number, element: any) => {
        try {
          const $element = $(element);
          const id = $element.attr('id')?.replace('rec-', ''); // Extract the numeric ID

          if (!id) {
            console.log('Skipping element - no valid ID found');
            return;
          }

          // Extract job information using the proper selectors within this element
          const title = $element.find('.job_tit a').text().trim();
          const companyUrl = $element.find('.job_tit a').attr('href');
          const companyName = $element.find('.col.company_nm a').text().trim();
          const location = $element.find('.work_place').text().trim();
          const employmentType = $element.find('.career').text().trim();
          const education = $element.find('.education').text().trim();
          const deadline = $element.find('.col.support_info p span.date').text().trim() ||
            $element.find('div.box_item div.col.support_info p span.date').text().trim();

          // Extract job meta information (기술스택, 우대사항 등)
          const stackElements = $element.find('div.box_item div.col.notification_info div.job_meta span span');
          const stacks: string[] = [];
          stackElements.each((_, stackElement) => {
            stacks.push($(stackElement).text().trim());
          });
            // .map((_, span) => $(span).text().trim())
            // .get()
            // .filter(text => text.length > 0);

          // Extract job badges (정규직, 경력 등)
          const badge = $element.find('.job_badge span').text().trim()

          console.log(`Processing job ID ${id}:`, {
            title,
            companyName,
            companyUrl,
            location,
            employmentType,
            education,
            deadline,
            stacks,
            badge,
          });

          const res = this.jobsRepository
            .createQueryBuilder()
            .insert()
            .values({
              id,
              title,
              companyName,
              companyUrl,
              location,
              employmentType,
              stacks,
              education,
              deadline,
              badge,
            })
            .execute();

          console.log(res);

        } catch (error) {
          console.error('Error processing job element:', error);
        }
      });

      return {
        success: true,
        data: `Successfully crawled jobs`
      };
    } catch (error) {
      console.error('Crawling error:', error);
      throw new Error(`Crawling failed: ${error.message}`);
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
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
      job.viewCount = job.viewCount + 1;
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
