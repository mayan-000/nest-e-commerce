import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Catalog } from './catalog.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  category: string;

  @ManyToOne(() => Catalog, (catalog) => catalog.products, { nullable: true })
  catalog?: Catalog;

  // product images, reviews, and other fields
}
