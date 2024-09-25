import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  await app.listen(3000);
  console.log(`Server is running on port: 3000`);
}
bootstrap();
