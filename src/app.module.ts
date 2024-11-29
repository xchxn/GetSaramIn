import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplyModule } from './modules/apply/apply.module';
import { CommunityModule } from './modules/community/community.module';
import { CompanyModule } from './modules/company/company.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DatabaseModule,
    JobsModule,
    ApplyModule,
    CommunityModule,
    CompanyModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
