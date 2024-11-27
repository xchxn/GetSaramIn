import { AppDataSource } from './database.config';

export const DatabaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      return AppDataSource.initialize();
    },
  },
];
