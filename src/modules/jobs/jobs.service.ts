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
    });
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const collectedJobs: JobsEntity[] = [];

    const url = `${baseUrl}//zf_user/jobs/list/job-category?cat_kewd=2239%2C84&panel_type=&search_optional_item=n&search_done=y&panel_count=y&preview=y&page=1&page_count=100`;
    try {
      console.log('start crawling');

      await page.goto(url, { waitUntil: 'networkidle0' });
      // 페이지가 완전히 로드될 때까지 기다림
      const content = await page.content();

      const $ = cheerio.load(content);

      const getTextContent = (selector: string) => {
        return $(selector).text().trim();
      };

      const getHrefContent = (selector: string) => {
        return $(selector).attr('href');
      };

      // $에서 #rec-12345678 형식 모두 확인하기
      const elements = $('#rec-49170109')

      console.log(elements);

      elements.each((element: any) => {
        const id = $(element).attr('id'); // 요소의 ID 가져오기
        console.log('Found element ID:', id);

        const company_nm = getTextContent(`#rec-${id} > div.box_item > div.col.company_nm > span.str_tit`);
        const title = getTextContent(`#rec_link_${id} > span`);
        const stack_text = getTextContent(`#rec-${id} > div.box_item > div.col.notification_info > div.job_meta > span > span:nth-child(1)`);
        const badge_text = getTextContent(`#rec-${id} > div.box_item > div.col.notification_info > div.job_badge > span`);
        const work_place = getTextContent(`#rec-${id} > div.box_item > div.col.recruit_info > ul > li:nth-child(1) > p`);
        const career = getTextContent(`#rec-${id} > div.box_item > div.col.recruit_info > ul > li:nth-child(2) > p`);
        const education = getTextContent(`#rec-${id} > div.box_item > div.col.recruit_info > ul > li:nth-child(3) > p`);
        const deadline = getTextContent(`#rec-${id} > div.box_item > div.col.support_info > p > span.date`);
        const url_href = getHrefContent(`#rec_link_${id}`);

        console.log({
          id,
          company_nm,
          title,
          stack_text,
          badge_text,
          work_place,
          career,
          education,
          deadline,
          url_href
        });
      });

      await page.close();

      return `Successfully crawled and saved ${collectedJobs.length} jobs`;
    } catch (error) {
      if (page) await page.close();
      if (browser) await browser.close();
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
