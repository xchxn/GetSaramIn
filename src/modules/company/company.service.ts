import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CompanyEntity } from 'src/entities/company.entity';

@Injectable()
export class CompanyService {
    constructor(
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: Repository<CompanyEntity>    
    ) {}
    
    async getCompany(): Promise<CompanyEntity[]> {
        return this.companyRepository.find();
    }
}
