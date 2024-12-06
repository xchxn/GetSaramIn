import { DataSource } from 'typeorm';
import { EventsEntity } from 'src/entities/event.entity';

export const eventProviders = [
  {
    provide: 'EVENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EventsEntity),
    inject: ['DATA_SOURCE'],
  },
];
