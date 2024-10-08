import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Order } from '../entities';
import { CreateOrderDto, ReturnOrderDto, UpdateOrderDto } from '../dto';
import { NotificationService } from './notification.service';

@Injectable()
export class OrdersService {
  private client: ClientProxy;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly notificationService: NotificationService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URL')],
        queue: 'orders_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    const savedOrder = await this.orderRepository.save(order);

    this.client.emit('update_inventory', {
      orderId: savedOrder.id,
      items: createOrderDto.items,
      type: 'order_created',
    });

    await this.notificationService.sendOrderConfirmation(
      savedOrder.userId,
      savedOrder.id,
    );

    return savedOrder;
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<void> {
    await this.orderRepository.update(id, updateOrderDto);

    const order = await this.orderRepository.findOneBy({ id });
    if (order) {
      await this.notificationService.sendOrderStatusUpdate(
        order.userId,
        order.id,
        order.status,
      );
    }
  }

  async getOrderById(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }

  async listOrders(userId?: number): Promise<Order[]> {
    if (userId) {
      return this.orderRepository.find({ where: { userId } });
    }
    return this.orderRepository.find();
  }

  async cancelOrder(id: number, userId: number): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (order && order.status === 'processing') {
      order.status = 'canceled';
      await this.orderRepository.save(order);

      this.client.emit('update_inventory', {
        orderId: order.id,
        items: order.items,
        type: 'order_canceled',
      });

      await this.notificationService.sendOrderStatusUpdate(
        order.userId,
        order.id,
        order.status,
      );
    } else {
      throw new Error('Order cannot be canceled');
    }
  }

  async returnOrder(
    id: number,
    returnOrderDto: ReturnOrderDto,
    userId?: number,
  ): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (userId && order.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to return this order',
      );
    }

    if (order && order.status === 'delivered') {
      order.status = 'returned';
      await this.orderRepository.save({ ...order, ...returnOrderDto });

      this.client.emit('update_inventory', {
        orderId: order.id,
        items: order.items,
        type: 'order_returned',
      });

      await this.notificationService.sendOrderStatusUpdate(
        order.userId,
        order.id,
        order.status,
      );
    } else {
      throw new Error('Order cannot be returned');
    }
  }

  async getOrdersToBeScheduled(): Promise<Order[]> {
    return this.orderRepository.find({ where: { status: 'pending' } });
  }

  async processOrder(id: number): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id });
    if (order) {
      order.status = 'processing';
      await this.orderRepository.save(order);
    }
  }

  async updateDeliveryStatus(
    id: number,
    deliveryStatus: string,
    currentAddress?: string,
  ): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id });
    if (order) {
      order.deliveryStatus = deliveryStatus;
      if (currentAddress) {
        order.currentAddress = currentAddress;
      }
      await this.orderRepository.save(order);

      await this.notificationService.sendDeliveryNotification(
        order.userId,
        order.id,
        deliveryStatus,
      );
    }
  }

  async getDeliveryStatus(
    id: number,
    userId: number,
  ): Promise<{ deliveryStatus: string; currentAddress: string }> {
    const order = await this.orderRepository.findOneBy({ id });

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order
      ? {
          deliveryStatus: order.deliveryStatus,
          currentAddress: order.currentAddress,
        }
      : null;
  }
}
