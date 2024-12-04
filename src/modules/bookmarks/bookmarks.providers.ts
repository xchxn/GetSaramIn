import { DataSource } from 'typeorm';
import { BookmarksEntity } from 'src/entities/bookmark.entity';

export const bookmarksProviders = [
  {
    provide: 'BOOKMARKS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(BookmarksEntity),
    inject: ['DATA_SOURCE'],
  },
];
