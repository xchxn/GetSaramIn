import { Controller, Get, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) {}

    @ApiOperation({ summary: 'Get company information' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved company information' })
    @Get('crawl')
    getCompanyInformation(): Promise<any> {
        return this.companyService.getCompany();
    }

    @ApiOperation({ summary: 'Get list of companies' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved company list' })
    @Get('list')
    getCompanyList(): Promise<any> {
        return this.companyService.getCompanylist();
    }

    @ApiOperation({ summary: 'Get company by ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved company' })
    @ApiResponse({ status: 404, description: 'Company not found' })
    @ApiQuery({ name: 'id', required: true, description: 'Company ID' })
    @Get(':id')
    getCompanyById(@Query('id') id: string): Promise<any> {
        return this.companyService.getCompanyById(id);
    }
}
