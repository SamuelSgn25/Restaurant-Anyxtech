import { IsIn } from 'class-validator';
import { OrderStatus } from '../../common/types';

const statuses: OrderStatus[] = [
  'draft',
  'sent_to_kitchen',
  'in_preparation',
  'ready',
  'served',
  'closed'
];

export class UpdateOrderStatusDto {
  @IsIn(statuses)
  status!: OrderStatus;
}
