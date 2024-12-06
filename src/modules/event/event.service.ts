import { Inject, Injectable } from '@nestjs/common';
import { EventsEntity } from 'src/entities/event.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class EventService {
    constructor(
        @Inject('EVENT_REPOSITORY')
        private readonly eventRepository: Repository<EventsEntity>,
    ) {}

    async getEvents(): Promise<EventsEntity[]> {
        return await this.eventRepository.find();
    }   
}
