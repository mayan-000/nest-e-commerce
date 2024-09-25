import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  status: string;

  @Column('decimal')
  totalAmount: number;

  @Column('json')
  items: Array<{ productId: number; quantity: number; price: number }>;

  @Column()
  shippingAddress: string;

  @Column()
  billingAddress: string;

  @Column()
  paymentMethod: string;

  @Column({ nullable: true })
  orderNotes?: string;

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column({ nullable: true, type: 'timestamp' })
  deliveryDate?: Date;

  @Column({ nullable: true })
  returnReason?: string;

  @Column({ nullable: true })
  returnCondition?: string;

  @Column({ nullable: true })
  returnComments?: string;

  @Column({ nullable: true })
  deliveryStatus?: string;

  @Column({ nullable: true })
  currentAddress?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
