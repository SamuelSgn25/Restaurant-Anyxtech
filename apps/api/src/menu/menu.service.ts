import { Injectable } from '@nestjs/common';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  getMenu() {
    return this.restaurantDataService.getMenuCategories();
  }

  create(createdBy: string, payload: CreateMenuItemDto) {
    return this.restaurantDataService.createMenuItem(createdBy, {
      ...payload,
      available: payload.available ?? true,
      tags: payload.tags ?? []
    });
  }

  updateAvailability(id: string, available: boolean) {
    return this.restaurantDataService.updateMenuItemAvailability(id, available);
  }
}
