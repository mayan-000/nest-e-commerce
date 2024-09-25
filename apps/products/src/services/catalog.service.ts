import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from '../entities/catalog.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
  ) {}

  async findAll(): Promise<Catalog[]> {
    return this.catalogRepository.find();
  }

  async findOne(id: number): Promise<Catalog> {
    return this.catalogRepository.findOneBy({ id });
  }

  async create(catalog: Catalog): Promise<Catalog> {
    return this.catalogRepository.save(catalog);
  }

  async update(id: number, catalog: Catalog): Promise<void> {
    await this.catalogRepository.update(id, catalog);
  }

  async remove(id: number): Promise<void> {
    await this.catalogRepository.delete(id);
  }
}
