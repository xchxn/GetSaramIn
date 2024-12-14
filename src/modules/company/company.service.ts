import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CompanyEntity } from 'src/entities/company.entity';
import { ConfigService } from '@nestjs/config';
import { JobsEntity } from 'src/entities/jobs.entity';

@Injectable()
export class CompanyService {
  constructor(
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: Repository<CompanyEntity>,
    @Inject('JOBS_REPOSITORY')
    private readonly jobRepository: Repository<JobsEntity>,
    private readonly configService: ConfigService,
  ) { }

  async getCompany(): Promise<any> {
    const cheerio = require('cheerio');
    const puppeteer = require('puppeteer');

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

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setCacheEnabled(false);

    const companys = await this.jobRepository
      .createQueryBuilder()
      .select('companyUrl')
      .addSelect('id')
      .distinct(true)
      .where('companyUrl IS NOT NULL')  // NULL이 아닌 데이터만 선택
      .andWhere('companyUrl != :empty', { empty: '' })  // 빈 문자열도 제외
      .orderBy('companyUrl', 'ASC')
      .take(50)
      .getRawMany();

    console.log(companys);

    for await (const element of companys) {
      // 쿼리 문자열 부분만 자르기
      const queryString = element.companyUrl.split('?')[1];

      // 각 쿼리 파라미터를 분리 후, csn 찾기
      const params = queryString.split('&');
      let csn = null;

      for (const param of params) {
        const [key, value] = param.split('=');
        if (key === 'csn') {
          csn = value;
          break;
        }
      }

      let url = `${baseUrl}/zf_user/company-info/view?csn=${csn}`;

      console.log(url);

      await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 0
      });

      const content = await page.content();

      const $ = cheerio.load(content);

      const company_type = $('.area_company_infos > div > dl > div:nth-child(1) > dd').text().trim();
      const company_scale = $('.area_company_infos > ul > li:nth-child(2) > div > button > strong').text().trim();
      const company_history = $('.area_company_infos > ul > li:nth-child(1) > strong').text().trim();
      const company_homepage = $('.area_company_infos > div > dl > div:nth-child(3) > dd > a').attr('href');
      const company_address = $('.area_company_infos > div > dl > div:nth-child(5) > dd > p').text().trim();
      const company_ceo = $('.area_company_infos > div > dl > div:nth-child(2) > dd').text().trim();
      const company_content = $('.area_company_infos > div > dl > div:nth-child(4) > dd > p').text().trim();
      const company_headcount = $('.area_company_infos > ul > li:nth-child(3) > div > strong').text().trim();

      console.log({
        id: element.id,
        company_type,
        company_scale,
        company_history,
        company_homepage,
        company_address,
        company_ceo,
        company_content,
        company_headcount
      });

      const existingCompany = await this.companyRepository.findOne({
        where: { id: element.id }
      });

      if (existingCompany) {
        console.log(`Company with ID ${element.id} already exists, skipping...`);
        continue;
      }

      const result = await this.companyRepository
        .createQueryBuilder()
        .insert()
        .values({
          id: element.id,
          company_type,
          company_scale,
          company_history,
          company_homepage,
          company_address,
          company_ceo,
          company_content,
          company_headcount
        })
        .execute();

      console.log(result);
    };

    if (page) await page.close();
    if (browser) await browser.close();

    return true;
  }

  async getCompanylist(): Promise<any> {
    const list = await this.companyRepository.find();
    return list;
  }

  async getCompanyById(id: any): Promise<any> {
    const target = await this.companyRepository.findOne({ where: { id } });

    return target;
  }
}
