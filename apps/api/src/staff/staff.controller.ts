import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { RestaurantDataService } from '../data/restaurant-data.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Roles('super_admin', 'admin')
  @Get()
  findAll() {
    return this.restaurantDataService.getPublicUsers();
  }
}
