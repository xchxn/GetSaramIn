import { DataSource } from 'typeorm';
import { CompanyEntity } from 'src/entities/company.entity';

export const companyProviders = [
  {
    provide: 'COMPANY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CompanyEntity),
    inject: ['DATA_SOURCE'],
  },
];
