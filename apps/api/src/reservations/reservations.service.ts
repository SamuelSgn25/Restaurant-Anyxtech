import { Injectable } from '@nestjs/common';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  findAll() {
    return this.restaurantDataService.getReservations();
  }

  create(payload: CreateReservationDto, source: 'website' | 'staff' = 'website') {
    return this.restaurantDataService.createReservation({
      ...payload,
      source
    });
  }

  updateStatus(id: string, status: Parameters<RestaurantDataService['updateReservationStatus']>[1]) {
    return this.restaurantDataService.updateReservationStatus(id, status);
  }

  assignTable(id: string, tableId?: string) {
    return this.restaurantDataService.assignReservationToTable(id, tableId);
  }
}
