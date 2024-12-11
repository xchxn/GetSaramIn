import { Inject, Injectable } from '@nestjs/common';
import { CommunityEntity } from 'src/entities/community.entity';
import { QueryBuilder, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommunityService {
  constructor(
    @Inject('COMMUNITY_REPOSITORY')
    private readonly communityRepository: Repository<CommunityEntity>,
    private readonly configService: ConfigService,
  ) { }

  async getCommunity(startIdx: number, endIdx: number): Promise<CommunityEntity[]> {
    const puppeteer = require('puppeteer');
    const cheerio = require('cheerio');

    const browser = await puppeteer.launch({
      headless: true,
    });
    const baseUrl = this.configService.get('CARRER_REQUEST_URL');

    const page = await browser.newPage();

    // page config
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const collectedPosts: CommunityEntity[] = [];

    for (let i = startIdx; i <= endIdx; i++) {
      try {
        const url = `${baseUrl}/feed/view/${i}`;

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        const content = await page.content();

        const $ = cheerio.load(content);

        const title = $(`body > main.AppSubContainer_root__Do95h.AppSubContainer_isFirst__5vEVE > div > div.PoseHeadLine_root__urpc2 > h3 > b`).text().trim(); 
        const contentSelector = `body > main.AppSubContainer_root__Do95h.AppSubContainer_isFirst__5vEVE > div > div.PoseContent_root__rjmsz > div`;
        const contentDiv = $(contentSelector);
        
        // Get all p tags under the content div and combine their text
        const contents = contentDiv.find('p')
          .map((_, element) => $(element).text().trim())
          .get()
          .join('\n');

        // Only proceed if we have valid content
        if (title && contents.length > 0) {
          console.log(`Successfully crawled page ${i}:`, { title });

          const input = await this.communityRepository
            .createQueryBuilder()
            .insert()
            .values({
              id: i,
              title: title,
              contents: contents 
            })
            .execute();

          console.log(`Saved page ${i} to database`);
        } else {
          console.log(`Skipping page ${i}: No valid content found`);
        }
      } catch (error) {
        console.error(`Error processing page ${i}:`, error.message);
        continue; // Skip to next page on error
      }
    }

    if (page) await page.close();
    if (browser) await browser.close();

    return collectedPosts;
  }
}
