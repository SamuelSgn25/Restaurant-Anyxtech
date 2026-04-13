import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Roles('super_admin', 'admin', 'server', 'chef', 'cashier')
  @Get()
  findAll() {
    return this.restaurantDataService.getTables();
  }

  @Roles('super_admin', 'admin', 'server')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() payload: UpdateTableStatusDto) {
    return this.restaurantDataService.updateTableStatus(id, payload.status);
  }
}
