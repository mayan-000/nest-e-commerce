import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from '../services';
import { CatalogController } from '../controllers';
import { Catalog } from '../entities/catalog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
