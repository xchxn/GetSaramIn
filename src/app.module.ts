import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplyModule } from './modules/apply/apply.module';
import { CommunityModule } from './modules/community/community.module';
import { CompanyModule } from './modules/company/company.module';
import { HttpModule } from '@nestjs/axios';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { EventModule } from './modules/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule, 
    AuthModule,
    JobsModule,
    ApplyModule,
    CommunityModule,
    CompanyModule,
    HttpModule,
    BookmarksModule,
    EventModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
