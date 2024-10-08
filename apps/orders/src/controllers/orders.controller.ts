import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService, PaymentService } from '../services';
import { Order } from '../entities';
import { ReturnOrderDto, CreateOrderDto, UpdateOrderDto } from '../dto';
import { JwtAuthGuard } from 'libs';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums';
import { Roles } from '../decorators';
import { UserIdGuard } from '../guards';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DeliveryAgent, Role.System)
  @Put(':id')
  updateOrder(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<void> {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrderById(@Param('id') id: number, @Req() req): Promise<Order> {
    const userId = req.user.id;
    return this.ordersService.getOrderById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listOrders(@Query('userId') userId?: number): Promise<Order[]> {
    return this.ordersService.listOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  cancelOrder(@Param('id') id: number, @Req() req): Promise<void> {
    const userId = req.user.id;
    return this.ordersService.cancelOrder(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, UserIdGuard)
  @Roles(Role.DeliveryAgent, Role.System, Role.User)
  @Put(':id/return')
  returnOrder(
    @Param('id') id: number,
    @Body() returnOrderDto: ReturnOrderDto,
    @Req() req,
  ): Promise<void> {
    const userId = req.user.roles.includes(Role.User) ? req.user.id : null;
    return this.ordersService.returnOrder(id, returnOrderDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DeliveryAgent, Role.System)
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

  @UseGuards(JwtAuthGuard)
  @Get(':id/delivery-status')
  getDeliveryStatus(
    @Param('id') id: number,
    @Req() req,
  ): Promise<{ deliveryStatus: string; currentAddress: string }> {
    const userId = req.user.id;
    return this.ordersService.getDeliveryStatus(id, userId);
  }

  @Post(':id/payment')
  async processPayment(
    @Param('id') id: number,
    @Body('amount') amount: number,
  ): Promise<{ status: string; transactionId: string }> {
    return this.paymentService.processPayment(id, amount);
  }

  @Post('refund')
  async refundPayment(
    @Body('transactionId') transactionId: string,
  ): Promise<{ status: string }> {
    return this.paymentService.refundPayment(transactionId);
  }

  @Get('payment-status/:transactionId')
  async getPaymentStatus(
    @Param('transactionId') transactionId: string,
  ): Promise<{ status: string }> {
    return this.paymentService.getPaymentStatus(transactionId);
  }
}
