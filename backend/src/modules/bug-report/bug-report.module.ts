import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BugReportController } from './bug-report.controller';
import { BugReportService } from './services/bug-report.service';
import { BugReportEntity } from './entities/bug-report.entity';
import { BugReportRepository } from './repositories/bug-report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BugReportEntity])],
  controllers: [BugReportController],
  providers: [BugReportService, BugReportRepository],
  exports: [BugReportService, BugReportRepository],
})
export class BugReportModule {}
