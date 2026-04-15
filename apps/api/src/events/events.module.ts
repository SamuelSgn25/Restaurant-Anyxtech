import { Module, forwardRef } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { DataModule } from '../data/data.module';

@Module({
  imports: [forwardRef(() => DataModule)],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway],
  exports: [EventsGateway]
})
export class EventsModule {}
