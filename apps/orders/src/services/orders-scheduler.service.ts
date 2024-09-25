import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersSchedulerService {
  constructor(private readonly ordersService: OrdersService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledOrders() {
    console.log('Handling scheduled orders...');
    const orders = await this.ordersService.getOrdersToBeScheduled();
    for (const order of orders) {
      await this.ordersService.processOrder(order.id);
    }
  }
}
