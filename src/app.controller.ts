import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/search')
  async search(
    @Query('category') category: string,
    @Query('keyword') keyword: string,
  ) {
    return this.appService.search(category, keyword);
  }
}
