import { Controller, Get, Query } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) {}

    @Get()
    getCompanyInformation(): Promise<any> {
        return this.companyService.getCompany();
    }
}
