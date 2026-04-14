import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { UserRole } from '../common/types';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Roles('super_admin', 'admin')
  @Get()
  findAll() {
    return this.restaurantDataService.getPublicUsers();
  }

  @Roles('super_admin', 'admin')
  @Post()
  create(
    @Req() request: { user: { id: string; role: UserRole } },
    @Body() payload: CreateStaffDto
  ) {
    return this.restaurantDataService.createStaff(request.user, payload);
  }

  @Roles('super_admin', 'admin', 'server', 'chef', 'cashier')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: any
  ) {
    return this.restaurantDataService.updateUser(id, payload);
  }
}
