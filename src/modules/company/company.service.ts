import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CompanyEntity } from 'src/entities/company.entity';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
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

	async getCompany(req: any): Promise<any> {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');

    const page = await browser.newPage();

    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
		const companyUrl = this.jobRepository.find({ select: ['companyUrl'], where: { id: req.id } });
		const url = `${baseUrl}/${companyUrl}`;

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

		const company_type = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > div > dl > div:nth-child(1) > dd');
		const company_scale = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > ul > li:nth-child(2) > div > button > strong');
		const company_history = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > ul > li:nth-child(1) > strong');
		const company_homepage = getHrefContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > div > dl > div:nth-child(3) > dd > a');
		const company_address = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > div > dl > div:nth-child(5) > dd > p');
		const company_ceo = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > div > dl > div:nth-child(2) > dd');
		const company_content = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > div > dl > div:nth-child(4) > dd > p');
    const company_headcount = getTextContent('#content > div > div.main_content.cont_introduce > section.section.workplace_section > div.section_content > div.area_company_infos > ul > li:nth-child(3) > div > strong');

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
      .into(CompanyEntity)
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
}
