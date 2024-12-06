import { DataSource } from 'typeorm';
import { CommunityEntity } from 'src/entities/community.entity';

export const communityProviders = [
  {
    provide: 'COMMUNITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CommunityEntity),
    inject: ['DATA_SOURCE'],
  },
];
