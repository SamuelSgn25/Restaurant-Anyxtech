import { IsIn } from 'class-validator';
import { ReservationStatus } from '../../common/types';

const statuses: ReservationStatus[] = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];

export class UpdateReservationStatusDto {
  @IsIn(statuses)
  status!: ReservationStatus;
}
