import { Inject, Injectable } from '@nestjs/common';
import { CommunityEntity } from 'src/entities/community.entity';
import { Repository } from 'typeorm';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommunityService {
	constructor(
		@Inject('COMMUNITY_REPOSITORY')
		private readonly communityRepository: Repository<CommunityEntity>,
		private readonly configService: ConfigService,
	) { }

	async getCommunity(): Promise<CommunityEntity[]> {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const baseUrl = this.configService.get('CARRER_REQUEST_URL');

    const page = await browser.newPage();

    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
		const url = `${baseUrl}/?t_ref=pc_main_gnb_title`;

    await page.goto(url);
		// 페이지가 완전히 로드될 때까지 기다림
		await page.waitForSelector('#content', { timeout: 120000 });
		const content = await page.content();
		
		const $ = cheerio.load(content);

    const collectedPosts: CommunityEntity[] = [];
    
    $('body > main > div > div > div > div.MainContainer_mainContent__bCQ4Q > div.Post_post____wbD > div.PostList_postList__kV1Io > ul > li').each((index, element) => {
      const title = $(element).find('div.ListItem_post__hkkIQ > div > h3').text().trim();
      const content = $(element).find('div.ListItem_post__hkkIQ > div > div').text().trim();

      if (title && content) {
        const communityEntity = new CommunityEntity();
        Object.assign(communityEntity, {
          title,
          content
        });
        collectedPosts.push(communityEntity);
      }
    });

    await this.communityRepository.save(collectedPosts);
    return collectedPosts;
	}
}
