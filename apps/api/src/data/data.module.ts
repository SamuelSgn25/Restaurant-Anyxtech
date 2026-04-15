import { Global, Module, forwardRef } from '@nestjs/common';
import { RestaurantDataService } from './restaurant-data.service';
import { EventsModule } from '../events/events.module';

@Global()
@Module({
  imports: [forwardRef(() => EventsModule)],
  providers: [RestaurantDataService],
  exports: [RestaurantDataService]
})
export class DataModule {}
