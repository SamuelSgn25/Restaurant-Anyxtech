import { IsIn } from 'class-validator';
import { TableStatus } from '../../common/types';

const statuses: TableStatus[] = ['available', 'occupied', 'reserved', 'cleaning'];

export class UpdateTableStatusDto {
  @IsIn(statuses)
  status!: TableStatus;
}
