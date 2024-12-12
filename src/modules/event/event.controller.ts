import { Controller, Get, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Event')
@Controller('event')
export class EventController {
    constructor(
        private readonly eventService: EventService
    ) {}

    @ApiOperation({ summary: 'Crawl events information' })
    @ApiResponse({ status: 200, description: 'Successfully crawled events' })
    @Get('crawl')
    getEvents() {
        return this.eventService.getEvents();
    }

    @ApiOperation({ summary: 'Get list of events' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved events list' })
    @Get('list')
    getEventList() {
        return this.eventService.getEventList();
    }

    @ApiOperation({ summary: 'Get event by ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved event' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    @ApiQuery({ name: 'id', required: true, description: 'Event ID', type: 'number' })
    @Get(':id')
    getEventById(@Query('id') id: number) {
        return this.eventService.getEventById(id);
    }
}
