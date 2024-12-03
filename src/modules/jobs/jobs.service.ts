import { Injectable, Inject } from '@nestjs/common';
import { JobsEntity } from 'src/entities/jobs.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

@Injectable()
export class JobsService {
  constructor(
    @Inject('JOBS_REPOSITORY')
    private readonly jobsRepository: Repository<JobsEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getJobs(): Promise<any> {
    const browser = await puppeteer.launch();
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');
    const url = `${baseUrl}/job-category?cat_kewd=84&loc_mcd=101000%2C102000&panel_type=&search_optional_item=n&search_done=y&panel_count=y&preview=y&page=1&page_count=100`;

    try {
      const page = await browser.newPage();

      // 브라우저 설정 추가
      await page.setDefaultNavigationTimeout(60000); // 타임아웃 30초로 설정
      await page.setRequestInterception(true);

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );

      // 불필요한 리소스 차단
      page.on('request', (request) => {
        if (
          ['image', 'stylesheet', 'font', 'media'].includes(
            request.resourceType(),
          )
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle2'], // 변경된 waitUntil 옵션
        timeout: 60000,
      });

      // 4. 특정 요소가 로드될 때까지 대기
      await page.waitForSelector('.list_item', {
        timeout: 60000,
      });

      const jobs = await page.evaluate(() => {
        const jobItems = document.querySelectorAll('.list_item');
        return Array.from(jobItems).map((item) => {
          return {
            companyName: item
              .querySelector('.company_nm .str_tit')
              ?.textContent?.trim(),
            jobTitle: item
              .querySelector('.job_tit .str_tit span')
              ?.textContent?.trim(),
            sectors: Array.from(item.querySelectorAll('.job_sector span'))
              .map((span) => span.textContent?.trim())
              .filter((text) => text),
            location: item.querySelector('.work_place')?.textContent?.trim(),
            career: item.querySelector('.career')?.textContent?.trim(),
            education: item.querySelector('.education')?.textContent?.trim(),
            deadline: item
              .querySelector('.support_detail .date')
              ?.textContent?.trim(),
            postedDate: item
              .querySelector('.support_detail .deadlines')
              ?.textContent?.trim(),
          };
        });
      });

      await page.close();
      console.log(jobs);
      return jobs;
    } catch (error) {
      console.error('Error scraping jobs:', error);
      throw error;
    }
  }
}
