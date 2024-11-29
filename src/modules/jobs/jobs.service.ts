import { Injectable, Inject } from '@nestjs/common';
import { JobsEntity } from 'src/entities/jobs.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class JobsService {
  constructor(
    @Inject('JOBS_REPOSITORY')
    private readonly jobsRepository: Repository<JobsEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getJobs(): Promise<any> {
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');
    const url = `${baseUrl}/zf_user/jobs/list/domestic`;

    try {
      const { data: mainHtml } = await axios.get(url, {
        maxRedirects: 5,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const $ = cheerio.load(mainHtml);

      const jobs = [];
      const links = $('a[id^="grand_link_"]');

      for (let i = 0; i < links.length; i++) {
        const jobUrl = baseUrl + $(links[i]).attr('href');
        const { data: jobHtml } = await axios.get(jobUrl);
        const $job = cheerio.load(jobHtml);

        const baseSelector =
          '#content > div.wrap_jview > section.jview > div.wrap_jv_cont > div.jv_cont.jv_summary > div > div';

        // 첫 번째 그룹 요소들 (div:nth-child(1))
        const experience = $job(
          `${baseSelector}:nth-child(1) > dl:nth-child(1) > dd > strong`,
        )
          .text()
          .trim();
        const education = $job(
          `${baseSelector}:nth-child(1) > dl:nth-child(2) > dd > strong`,
        )
          .text()
          .trim();
        const workType = $job(
          `${baseSelector}:nth-child(1) > dl:nth-child(3) > dd > strong`,
        )
          .text()
          .trim();

        // 두 번째 그룹 요소들 (div:nth-child(2))
        const salary = $job(
          `${baseSelector}:nth-child(2) > dl:nth-child(1) > dd`,
        )
          .text()
          .trim();
        const workday = $job(
          `${baseSelector}:nth-child(2) > dl:nth-child(2) > dd`,
        )
          .text()
          .trim();
        const location = $job(
          `${baseSelector}:nth-child(2) > dl:nth-child(3) > dd`,
        )
          .text()
          .trim();

        jobs.push({
          url: jobUrl,
          salary,
          experience,
          education,
          workType,
          workday,
          location,
        });
      }
      console.log(jobs);
      return jobs;
    } catch (error) {
      console.error('Error scraping jobs:', error);
      throw error;
    }
  }
}
