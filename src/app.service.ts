import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { format as StringFormat } from 'util';
import { parse as HtmlParse } from 'node-html-parser';
const DANGGN_URL = 'https://www.daangn.com/search/%s/more/flea_market?page=%d';
const WINDOW_SIZE = 50;
@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async search(category: string, keyword: string) {
    let offset = 0;
    let isLast = false;
    const results = [];

    do {
      const result = await this.getPages(category, offset);
      isLast = result.isLast;
      results.push(...result.items);
      offset += WINDOW_SIZE;
    } while (!isLast);

    return results.filter((item) => item.title.includes(keyword));
  }

  async getPages(category: string, offset: number = 0) {
    const promises = [];
    for (var i = offset; i < offset + WINDOW_SIZE; i++) {
      promises.push(this.getPage(category, i + 1));
    }
    const data = await Promise.all(promises);
    let isLast = false;

    const results = data.reduce((acc, cur) => {
      const root = HtmlParse(cur);
      const articles = root.querySelectorAll('.flea-market-article');
      if (articles.length < 1) {
        isLast = true;
        return acc;
      } else {
        return [
          ...acc,
          ...articles.map((article) => {
            const href = article
              .querySelector('.flea-market-article-link')
              .getAttribute('href');
            const title = article.querySelector('.article-title').text.trim();
            const address = article
              .querySelector('.article-region-name')
              .text.trim();
            const price = article.querySelector('.article-price').text.trim();
            return {
              href,
              title,
              address,
              price,
            };
          }),
        ];
      }
    }, []);

    return {
      items: results,
      isLast,
    };
  }

  async getPage(category: string, page: number) {
    const url = StringFormat(DANGGN_URL, encodeURI(category), page);
    console.log(`SEARCH PAGE : ${url}`);
    return (await firstValueFrom(this.httpService.get(url))).data;
  }
}
