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
    });
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');

    const page = await browser.newPage();

    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const companys = await this.jobRepository
      .createQueryBuilder()
      .select('companyUrl')
      .addSelect('id')
      .distinct(true)
      .getRawMany();

    console.log(companys);

    const companyDataArray = [];

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
        waitUntil: 'networkidle2',
        timeout: 60000
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

      if(this.companyRepository.findOne({ where: { id: element.id } })) {
        continue;
      }
      
      companyDataArray.push({
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
    };

    await this.companyRepository
        .createQueryBuilder()
        .insert()
        .values(companyDataArray)
        .execute()

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
