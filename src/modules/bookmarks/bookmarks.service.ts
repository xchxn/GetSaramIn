import { Inject, Injectable } from '@nestjs/common';
import { BookmarksEntity } from 'src/entities/bookmark.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookmarksService {
    constructor(
        @Inject('BOOKMARKS_REPOSITORY')
        private readonly bookmarksRepository: Repository<BookmarksEntity>,
    ) {}

    async setBookmark(userId: string, id: string): Promise<BookmarksEntity> {
        const bookmark = new BookmarksEntity();
        bookmark.id = id;
        bookmark.userId = userId;
        return this.bookmarksRepository.save(bookmark);
    }

    async getList(userId: string): Promise<BookmarksEntity[]> {
        return this.bookmarksRepository.find({
            where: { userId }
        });
    }

    async toggle(userId: string, id: string): Promise<{ bookmarked: boolean }> {
        const bookmark = await this.bookmarksRepository.findOne({
            where: { id, userId }
        });

        if (bookmark) {
            await this.bookmarksRepository.remove(bookmark);
            return { bookmarked: false };
        } else {
            await this.setBookmark(userId, id);
            return { bookmarked: true };
        }
    }

    async isBookmarked(userId: string, id: string): Promise<boolean> {
        const bookmark = await this.bookmarksRepository.findOne({
            where: { id, userId }
        });
        return !!bookmark;
    }
}
