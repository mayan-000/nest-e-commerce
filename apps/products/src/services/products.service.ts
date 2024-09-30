import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  EventPattern,
  Transport,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Catalog, Product } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  private client: ClientProxy;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URL')],
        queue: 'products_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['catalog'] });
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['catalog'],
    });
  }

  async create(
    productData: Partial<Product>,
    catalogId?: number,
  ): Promise<Product> {
    let catalog = null;
    if (catalogId) {
      catalog = await this.catalogRepository.findOneBy({ id: catalogId });
    }
    const product = this.productRepository.create({ ...productData, catalog });
    return this.productRepository.save(product);
  }

  async update(
    id: number,
    productData: Partial<Product>,
    catalogId?: number,
  ): Promise<void> {
    let catalog = null;
    if (catalogId) {
      catalog = await this.catalogRepository.findOneBy({ id: catalogId });
    }
    await this.productRepository.update(id, { ...productData, catalog });
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async updateInventory(
    _orderId: number,
    items: Array<{ productId: number; quantity: number }>,
    type: string,
  ): Promise<void> {
    const shouldAddOrRemove = type === 'order_created' ? 1 : -1;

    for (const item of items) {
      const product = await this.productRepository.findOneBy({
        id: item.productId,
      });

      if (product) {
        product.stock -= item.quantity * shouldAddOrRemove;
        await this.productRepository.save(product);
      }
    }
  }
}
