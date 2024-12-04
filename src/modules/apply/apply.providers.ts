import { DataSource } from 'typeorm';
import { ApplicationsEntity } from 'src/entities/applications.entity';

export const applyProviders = [
  {
    provide: 'APPLICATION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ApplicationsEntity),
    inject: ['DATA_SOURCE'],
  },
];
