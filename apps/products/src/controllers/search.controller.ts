import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../services';

@Controller('products/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query: string) {
    return this.searchService.searchProducts(query);
  }
}
