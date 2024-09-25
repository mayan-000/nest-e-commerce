import { Controller, Post, Put, Body, Param, Get, Query } from '@nestjs/common';
import { OrdersService } from '../services';
import { Order } from '../entities';
import { ReturnOrderDto, CreateOrderDto, UpdateOrderDto } from '../dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Put(':id')
  updateOrder(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<void> {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Get(':id')
  getOrderById(@Param('id') id: number): Promise<Order> {
    return this.ordersService.getOrderById(id);
  }

  @Get()
  listOrders(@Query('userId') userId?: number): Promise<Order[]> {
    return this.ordersService.listOrders(userId);
  }

  @Put(':id/cancel')
  cancelOrder(@Param('id') id: number): Promise<void> {
    return this.ordersService.cancelOrder(id);
  }

  @Put(':id/return')
  returnOrder(
    @Param('id') id: number,
    @Body() returnOrderDto: ReturnOrderDto,
  ): Promise<void> {
    return this.ordersService.returnOrder(id, returnOrderDto);
  }

  @Put(':id/delivery-status')
  updateDeliveryStatus(
    @Param('id') id: number,
    @Body('deliveryStatus') deliveryStatus: string,
    @Body('currentAddress') currentAddress?: string,
  ): Promise<void> {
    return this.ordersService.updateDeliveryStatus(
      id,
      deliveryStatus,
      currentAddress,
    );
  }

  @Get(':id/delivery-status')
  getDeliveryStatus(
    @Param('id') id: number,
  ): Promise<{ deliveryStatus: string; currentAddress: string }> {
    return this.ordersService.getDeliveryStatus(id);
  }
}
