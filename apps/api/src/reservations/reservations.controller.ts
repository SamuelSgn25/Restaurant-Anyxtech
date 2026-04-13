import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Public, Roles } from '../auth/auth.decorators';
import { AssignReservationTableDto } from './dto/assign-reservation-table.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('super_admin', 'admin', 'server')
  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Public()
  @Post()
  create(@Body() payload: CreateReservationDto) {
    return this.reservationsService.create(payload, 'website');
  }

  @Roles('super_admin', 'admin', 'server')
  @Post('staff')
  createByStaff(@Body() payload: CreateReservationDto) {
    return this.reservationsService.create(payload, 'staff');
  }

  @Roles('super_admin', 'admin', 'server')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() payload: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, payload.status);
  }

  @Roles('super_admin', 'admin', 'server')
  @Patch(':id/table')
  assignTable(@Param('id') id: string, @Body() payload: AssignReservationTableDto) {
    return this.reservationsService.assignTable(id, payload.tableId);
  }
}
