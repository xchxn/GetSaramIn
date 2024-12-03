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
      await page.setDefaultNavigationTimeout(120000); // 타임아웃 30초로 설정
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
        timeout: 120000,
      });

      // 4. 특정 요소가 로드될 때까지 대기
      await page.waitForSelector('.list_item', {
        timeout: 120000,
      });

      const jobs = await page.evaluate(() => {
        const jobItems = document.querySelectorAll('.list_item');
        return Array.from(jobItems).map((item) => {
          const recNumber = item.id.replace('rec-', ''); // id 값 추출
          return {
            id: recNumber, // PrimaryKey로 사용할 id
            companyName: item
              .querySelector('.company_nm .str_tit')
              ?.textContent?.trim(),
            jobTitle: item
              .querySelector('.job_tit .str_tit span')
              ?.textContent?.trim(),
            sectors: Array.from(item.querySelectorAll('.job_sector span'))
              .map((span) => span.textContent?.trim())
              .filter((text) => text)
              .join(', '), // 배열을 문자열로 변환
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

      await this.saveOptimized(jobs);

      await page.close();
      console.log(jobs);
      return jobs;
    } catch (error) {
      console.error('Error scraping jobs:', error);
      throw error;
    }
  }

  // 최적화된 저장 함수
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

  private validateJobData(job: any) {
    if (!job.id || !job.companyName || !job.jobTitle) {
      throw new Error('Required fields are missing');
    }
    return true;
  }
}
