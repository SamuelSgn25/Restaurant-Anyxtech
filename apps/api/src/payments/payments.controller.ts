import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('super_admin', 'admin')
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Roles('super_admin', 'admin')
  @Post()
  create(@Body() payload: CreatePaymentDto) {
    return this.paymentsService.create(payload);
  }
}
