import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from 'libs';
import { CatalogModule, SearchModule } from './modules';
import { ProductsService } from './services';
import { ProductsController } from './controllers';
import { Product } from './entities/product.entity';
import { Catalog } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Product, Catalog],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Product, Catalog]),
    ClientsModule.register([
      {
        name: 'PRODUCTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'products_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    AuthModule,
    SearchModule,
    CatalogModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
