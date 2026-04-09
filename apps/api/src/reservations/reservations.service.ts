import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  create(payload: CreateReservationDto) {
    return {
      id: `res-${Date.now()}`,
      status: 'pending',
      ...payload
    };
  }
}
