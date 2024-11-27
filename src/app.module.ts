import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CrawlController } from './crawl/crawl.controller';
import { CrawlService } from './crawl/crawl.service';
import { CrawlModule } from './crawl/crawl.module';
import { ApplyController } from './apply/apply.controller';
import { ApplyModule } from './apply/apply.module';

@Module({
  imports: [AuthModule, DatabaseModule, CrawlModule, ApplyModule],
  controllers: [
    AppController,
    AuthController,
    CrawlController,
    ApplyController,
  ],
  providers: [AppService, AuthService, CrawlService],
})
export class AppModule {}
