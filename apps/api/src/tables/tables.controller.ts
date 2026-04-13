import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Public, Roles } from '../auth/auth.decorators';
import { RestaurantDataService } from '../data/restaurant-data.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  @Public()
  @Get('public')
  findVisible() {
    return this.restaurantDataService.getVisibleTables();
  }

  @Roles('super_admin', 'admin', 'server', 'chef', 'cashier')
  @Get()
  findAll() {
    return this.restaurantDataService.getTables();
  }

  @Roles('super_admin', 'admin')
  @Post()
  create(@Body() payload: CreateTableDto) {
    return this.restaurantDataService.createTable({
      ...payload,
      status: payload.status ?? 'available'
    });
  }

  @Roles('super_admin', 'admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateTableDto) {
    return this.restaurantDataService.updateTable(id, payload);
  }

  @Roles('super_admin', 'admin', 'server')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() payload: UpdateTableStatusDto) {
    return this.restaurantDataService.updateTableStatus(id, payload.status);
  }

  @Roles('super_admin', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantDataService.deleteTable(id);
  }
}
