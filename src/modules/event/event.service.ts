import { Inject, Injectable } from '@nestjs/common';
import { EventsEntity } from 'src/entities/event.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventService {
    constructor(
        @Inject('EVENT_REPOSITORY')
        private readonly eventRepository: Repository<EventsEntity>,
		    private readonly configService: ConfigService,
      ) {}

    async getEvents(): Promise<EventsEntity[]> {
      const cheerio = require('cheerio');
      const puppeteer = require('puppeteer');

      const browser = await puppeteer.launch({
        headless: true,
      });
      const baseUrl = this.configService.get('DEFAULT_REQUEST_URL');
  
      const page = await browser.newPage();
  
      // page config
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      const url = `${baseUrl}/zf_user/help/live?category=3`;
  
      await page.goto(url);
      
      const content = await page.content();
      
      const $ = cheerio.load(content);
  
      const collectedEvents: EventsEntity[] = [];

      // 모든 이벤트 항목을 순회
      $('#content > div.wrap_board.event_board > ul.list_ing > li').each((index, element) => {
        const title = $(element).find('a > strong').text().trim();
        const date = $(element).find('a > span.date').text().trim();
        const target = $(element).find('a > span.target').text().trim();

        const res = this.eventRepository
          .createQueryBuilder()
          .insert()
          .values({ id: index, title, date, target })
          .execute();
        
        console.log(res);
      });

      if (page) await page.close();
      if (browser) await browser.close();
      
      return collectedEvents;
    }   
}
