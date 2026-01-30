import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScoreLog } from './enitities/ScoreLog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskDistributionService } from './service/TaskDistribution.service';
import { ContributorMicroTaskService } from './service/ContributorMicroTask.service';
import { MicroTaskStatisticsService } from './service/MicroTaskStatistics.service';
import { ContributorMicroTasks } from './enitities/ContributorMicroTasks.entity';
import { MicroTaskStatistics } from './enitities/MicroTaskStatistics.entity';
import { ProjectModule } from 'src/project/project.module';
import { DataSetModule } from 'src/data_set/data_set.module';
import { TaskDistributionController } from './controllers/TaskDistribution.controller';
import { TaskDistributionMonitoringService } from './service/TaskDistributionMonitoring.service';
import { TaskDistributionMonitoringController } from './controllers/TaskDistributionMonitoring.controller';
import { ReviewerTaskService } from './service/ReviewerTasks.service';
import { ReviewerTasks } from './enitities/ReviewerTasks.entity';
import { GetTasksService } from './service/GetTask.service';
import { TaskRedistributionService } from './service/TaskRedistribution.service';
import { TaskSubmissionService } from './service/TaskSubmission.service';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from 'src/cache/cache.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScoreLog,
      ContributorMicroTasks,
      MicroTaskStatistics,
      ReviewerTasks,
    ]),
    CacheModule,
    ProjectModule,
    forwardRef(() => DataSetModule),
    BullModule.registerQueue({
      name: 'file-upload',
      // redis options if not using forRoot globally
    }),
    AuthModule,
  ],
  exports: [
    TaskDistributionService,
    TaskDistributionMonitoringService,
    ReviewerTaskService,
  ],
  providers: [
    TaskDistributionService,
    ContributorMicroTaskService,
    GetTasksService,
    MicroTaskStatisticsService,
    TaskDistributionMonitoringService,
    ReviewerTaskService,
    TaskRedistributionService,
    TaskSubmissionService,
  ],
  controllers: [
    TaskDistributionController,
    TaskDistributionMonitoringController,
  ],
})
export class TaskDistributionModule {}
