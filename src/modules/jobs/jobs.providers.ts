import { DataSource } from 'typeorm';
import { JobsEntity } from 'src/entities/jobs.entity';

export const jobsProviders = [
  {
    provide: 'JOBS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(JobsEntity),
    inject: ['DATA_SOURCE'],
  },
];
