import { Inject, Injectable } from '@nestjs/common';
import { ApplicationsEntity } from 'src/entities/applications.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApplyService {
    constructor(
        @Inject('APPLY_REPOSITORY')
        private readonly applyRepository: Repository<ApplicationsEntity>,
    ) {}

    async apply(req: any): Promise<any> {
        return this.applyRepository.save(req);
    }

    async getHistory(): Promise<any> {
        return this.applyRepository.find({ relations: ['job'] });
    }

    async cancel(req: any): Promise<any> {
        return this.applyRepository.delete(req.id);
    }
}
