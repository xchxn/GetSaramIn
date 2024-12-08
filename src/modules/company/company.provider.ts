import { DataSource } from 'typeorm';
import { CompanyEntity } from 'src/entities/company.entity';
import { JobsEntity } from 'src/entities/jobs.entity';

export const companyProviders = [
  {
    provide: 'COMPANY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CompanyEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'JOBS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(JobsEntity),
    inject: ['DATA_SOURCE'],
  },
];
