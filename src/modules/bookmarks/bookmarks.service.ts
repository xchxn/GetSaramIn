import { Inject, Injectable } from '@nestjs/common';
import { BookmarksEntity } from 'src/entities/bookmark.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookmarksService {
    constructor(
        @Inject('BOOKMARKS_REPOSITORY')
        private readonly bookmarksRepository: Repository<BookmarksEntity>,
    ) {}

    async create(req: any): Promise<any> {
        return this.bookmarksRepository.save(req);
    }

    async getList(): Promise<any> {
        return this.bookmarksRepository.find();
    }
}
