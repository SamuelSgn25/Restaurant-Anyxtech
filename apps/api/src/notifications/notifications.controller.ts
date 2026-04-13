import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { RestaurantDataService } from '../data/restaurant-data.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Roles('super_admin', 'admin', 'server', 'chef', 'cashier')
  @Get()
  findAll() {
    return this.restaurantDataService.getNotifications();
  }

  @Roles('super_admin', 'admin', 'server', 'chef', 'cashier')
  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.restaurantDataService.markNotificationRead(id);
  }
}
