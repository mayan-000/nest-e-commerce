import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductsService } from '../services';
import { Product } from '../entities/product.entity';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(
    @Body() productData: Partial<Product>,
    @Body('catalogId') catalogId?: number,
  ) {
    return this.productsService.create(productData, catalogId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() productData: Partial<Product>,
    @Body('catalogId') catalogId?: number,
  ) {
    return this.productsService.update(id, productData, catalogId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  @EventPattern('update_inventory')
  async handleUpdateInventory(
    @Payload()
    data: {
      orderId: number;
      items: Array<{ productId: number; quantity: number }>;
      type: string;
    },
  ) {
    await this.productsService.updateInventory(
      data.orderId,
      data.items,
      data.type,
    );
  }
}
