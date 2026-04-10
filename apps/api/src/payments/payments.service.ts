import { Injectable } from '@nestjs/common';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  findAll() {
    return this.restaurantDataService.getPayments();
  }

  create(payload: CreatePaymentDto) {
    return this.restaurantDataService.createPayment(payload);
  }
}
