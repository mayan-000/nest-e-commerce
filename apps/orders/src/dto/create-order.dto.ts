export class CreateOrderDto {
  userId: number;
  totalAmount: number;
  items: Array<{ productId: number; quantity: number; price: number }>;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  orderNotes?: string; // Optional field
}
