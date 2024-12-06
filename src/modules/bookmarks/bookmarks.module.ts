import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { bookmarksProviders } from './bookmarks.providers';

@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService, ...bookmarksProviders]
})
export class BookmarksModule {}
