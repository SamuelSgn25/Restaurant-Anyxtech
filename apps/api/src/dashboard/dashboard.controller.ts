import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { RestaurantDataService } from '../data/restaurant-data.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Roles('super_admin', 'admin', 'server', 'chef', 'cashier')
  @Get('summary')
  summary() {
    return this.restaurantDataService.getDashboardSummary();
  }
}
