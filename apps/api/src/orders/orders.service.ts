import { Injectable } from '@nestjs/common';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  findAll() {
    return this.restaurantDataService.getOrders();
  }

  create(payload: CreateOrderDto) {
    return this.restaurantDataService.createOrder(payload);
  }

  moveToTable(id: string, tableId: string) {
    return this.restaurantDataService.moveOrderToTable(id, tableId);
  }

  updateStatus(id: string, status: Parameters<RestaurantDataService['updateOrderStatus']>[1]) {
    return this.restaurantDataService.updateOrderStatus(id, status);
  }
}
