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
    // const companyUrl = this.jobRepository.find({ select: ['companyUrl'], where: { id: req.id } });
    // const url = `${baseUrl}/${companyUrl}`;

    const url = `https://www.saramin.co.kr/zf_user/company-info/view?csn=eUZNenZvRUxDNVR4MXdOeW9rd3A4UT09&popup_yn=y`;

    await page.goto(url);

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
      company_type,
      company_scale,
      company_history,
      company_homepage,
      company_address,
      company_ceo,
      company_content,
      company_headcount
    });

    const query = await this.companyRepository
      .createQueryBuilder()
      .insert()
      .values({
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
    
    console.log(query);
    
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
