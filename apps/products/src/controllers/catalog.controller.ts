import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { Catalog } from '../entities/catalog.entity';

@Controller('products/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  findAll() {
    return this.catalogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.catalogService.findOne(id);
  }

  @Post()
  create(@Body() catalog: Catalog) {
    return this.catalogService.create(catalog);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() catalog: Catalog) {
    return this.catalogService.update(id, catalog);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.catalogService.remove(id);
  }
}
