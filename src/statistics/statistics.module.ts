import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DataSetModule } from 'src/data_set/data_set.module';
import { ProjectModule } from 'src/project/project.module';
import { SuperAdminStatistics } from './services/SuperAdminStatistics.service';
import { SuperAdminStatisticsController } from './controllers/SuperAdminStatistics.controller';
import { BaseDataModule } from 'src/base_data/base_data.module';
import { ProjectStatisticsController } from './controllers/ProjectStatistics.controller';
import { ProjectStatisticsService } from './services/ProjectStatistics.service';
import { ReviewerStatisticsController } from './controllers/ReviewerStatistics.controller';
import { ReviewerStatistics } from './services/ReviewerStatistics.service';
@Module({
  imports: [AuthModule, DataSetModule, ProjectModule, BaseDataModule],
  exports: [],
  providers: [
    SuperAdminStatistics,
    ProjectStatisticsService,
    ReviewerStatistics,
  ],
  controllers: [
    SuperAdminStatisticsController,
    ProjectStatisticsController,
    ReviewerStatisticsController,
  ],
})
export class StatisticsModule {}
