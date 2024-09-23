import { Controller, UseGuards, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from './../../../libs/auth/src/jwt.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
}
