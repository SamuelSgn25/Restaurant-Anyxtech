import { Injectable } from '@nestjs/common';
import { RestaurantDataService } from '../data/restaurant-data.service';

@Injectable()
export class MenuService {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  getMenu() {
    return this.restaurantDataService.getMenuCategories();
  }

  updateAvailability(id: string, available: boolean) {
    return this.restaurantDataService.updateMenuItemAvailability(id, available);
  }
}
