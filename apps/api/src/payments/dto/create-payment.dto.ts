import { IsIn, IsInt, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../../common/types';

const methods: PaymentMethod[] = ['cash', 'card', 'mobile_money'];

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsIn(methods)
  method!: PaymentMethod;

  @IsString()
  processedBy!: string;
}
