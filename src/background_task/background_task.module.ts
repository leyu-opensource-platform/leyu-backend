import { Module } from '@nestjs/common';
import { CacheModule } from 'src/cache/cache.module';
import { CommonModule } from 'src/common/common.module';
import { FileUploadProcessor } from './service/FileUploadProcessor.service';
import { DataSetModule } from 'src/data_set/data_set.module';
import { DatasetConsumer } from './service/DataSetConsumer.service';
import { FinanceModule } from 'src/finance/finance.module';
import { TaskDistributionModule } from 'src/task_distribution/task_distribution.module';
import { ProjectModule } from 'src/project/project.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    CacheModule,
    DataSetModule,
    CommonModule,
    FinanceModule,
    TaskDistributionModule,
    ProjectModule,
    AuthModule,
  ],
  providers: [FileUploadProcessor, DatasetConsumer],
  controllers: [],
  exports: [],
})
export class BackgroundTaskModule {}
