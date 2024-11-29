import { Module } from '@nestjs/common';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JobsController } from './modules/jobs/jobs.controller';
import { JobsService } from './modules/jobs/jobs.service';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplyController } from './modules/apply/apply.controller';
import { ApplyModule } from './modules/apply/apply.module';
import { CommunityController } from './modules/community/community.controller';
import { CommunityService } from './modules/community/community.service';
import { CommunityModule } from './modules/community/community.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    JobsModule,
    ApplyModule,
    CommunityModule,
    CompanyModule,
  ],
  controllers: [
    AuthController,
    JobsController,
    ApplyController,
    CommunityController,
  ],
  providers: [AuthService, JobsService, CommunityService],
})
export class AppModule {}
