import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Roles('super_admin', 'admin', 'chef')
  @Get('tickets')
  tickets() {
    return this.restaurantDataService.getKitchenTickets();
  }

  @Roles('super_admin', 'admin', 'chef')
  @Patch('tickets/:id/status')
  updateStatus(@Param('id') id: string, @Body() payload: UpdateOrderStatusDto) {
    return this.restaurantDataService.updateOrderStatus(id, payload.status);
  }
}
