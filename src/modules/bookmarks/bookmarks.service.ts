import { Inject, Injectable } from '@nestjs/common';
import { BookmarksEntity } from 'src/entities/bookmark.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class BookmarksService {
    constructor(
        @Inject('BOOKMARKS_REPOSITORY')
        private readonly bookmarksRepository: Repository<BookmarksEntity>,
    ) {}

    async setBookmark(userId: string, id: string): Promise<BookmarksEntity | null> {
        // Check if bookmark already exists
        const existingBookmark = await this.bookmarksRepository.findOne({
            where: { id, userId }
        });

        if (existingBookmark) {
            // If bookmark exists, remove it
            await this.bookmarksRepository.remove(existingBookmark);
            return null;
        }

        // If bookmark doesn't exist, create new one
        const bookmark = new BookmarksEntity();
        bookmark.id = id;
        bookmark.userId = userId;
        return this.bookmarksRepository.save(bookmark);
    }

    async getList(userId: string, pagination: PaginationDto): Promise<{ items: BookmarksEntity[], total: number }> {
        const [items, total] = await this.bookmarksRepository.findAndCount({
            where: { userId },
            relations: ['job'],
            order: { createdAt: 'DESC' },
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit
        });

        return { items, total };
    }
}
