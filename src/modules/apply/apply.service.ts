import { Inject, Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ApplicationsDto } from 'src/dto/applications.dto';
import { ApplicationsEntity } from 'src/entities/applications.entity';
import { Repository } from 'typeorm';
import { ApiResponseDto, ErrorCodes } from 'src/dto/api-response.dto';

@Injectable()
export class ApplyService {
    constructor(
        @Inject('APPLY_REPOSITORY')
        private readonly applyRepository: Repository<ApplicationsEntity>,
    ) {}

    async apply(req: any): Promise<ApiResponseDto<ApplicationsEntity>> {
        try {
            // Check for duplicate application
            const existingApplication = await this.applyRepository.findOne({
                where: {
                    email: req.email,
                    status: 'PENDING'
                }
            });

            if (existingApplication) {
                return {
                    success: false,
                    error: {
                        code: ErrorCodes.DUPLICATE_APPLICATION,
                        message: 'You already have a pending application'
                    }
                };
            }

            // Create new application
            const application = new ApplicationsEntity();
            Object.assign(application, {
                ...req,
                appliedDate: new Date(),
                status: 'PENDING',
                allowCancel: true
            });

            const savedApplication = await this.applyRepository.save(application);
            return {
                success: true,
                data: savedApplication
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: ErrorCodes.INTERNAL_ERROR,
                    message: 'Failed to process application'
                }
            };
        }
    }

    async getHistory(applicationsDto: ApplicationsDto): Promise<ApiResponseDto<ApplicationsEntity[]>> {
        try {
            const query = this.applyRepository.createQueryBuilder('application');

            // Apply filters
            query.where('application.email = :userId', { userId: applicationsDto.userId });

            if (applicationsDto.status) {
                query.andWhere('application.status = :status', { status: applicationsDto.status });
            }

            if (applicationsDto.startDate) {
                query.andWhere('application.appliedDate >= :startDate', { startDate: applicationsDto.startDate });
            }

            if (applicationsDto.endDate) {
                query.andWhere('application.appliedDate <= :endDate', { endDate: applicationsDto.endDate });
            }

            // Sort by date
            query.orderBy('application.appliedDate', 'DESC');

            const applications = await query.getMany();
            return {
                success: true,
                data: applications
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: ErrorCodes.INTERNAL_ERROR,
                    message: 'Failed to fetch application history'
                }
            };
        }
    }

    async cancel(req: { id: string, email: string }): Promise<ApiResponseDto<void>> {
        try {
            const application = await this.applyRepository.findOne({
                where: { 
                    id: req.id,
                    email: req.email
                }
            });

            if (!application) {
                return {
                    success: false,
                    error: {
                        code: ErrorCodes.APPLICATION_NOT_FOUND,
                        message: 'Application not found'
                    }
                };
            }

            if (!application.allowCancel) {
                return {
                    success: false,
                    error: {
                        code: ErrorCodes.CANCEL_NOT_ALLOWED,
                        message: 'This application cannot be cancelled'
                    }
                };
            }

            if (application.status !== 'PENDING') {
                return {
                    success: false,
                    error: {
                        code: ErrorCodes.INVALID_STATUS,
                        message: 'Only pending applications can be cancelled'
                    }
                };
            }

            // Update status instead of deleting
            application.status = 'CANCELLED';
            application.allowCancel = false;
            await this.applyRepository.save(application);

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: ErrorCodes.INTERNAL_ERROR,
                    message: 'Failed to cancel application'
                }
            };
        }
    }
}
