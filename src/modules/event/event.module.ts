import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { eventProviders } from './event.providers';

@Module({
  providers: [EventService, ...eventProviders],
  controllers: [EventController],
})
export class EventModule {}
