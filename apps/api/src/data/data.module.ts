import { Global, Module } from '@nestjs/common';
import { RestaurantDataService } from './restaurant-data.service';

@Global()
@Module({
  providers: [RestaurantDataService],
  exports: [RestaurantDataService]
})
export class DataModule {}
