import { forwardRef, Module } from '@nestjs/common';
import { DataSetModule } from 'src/data_set/data_set.module';
import { CacheService } from './CacheService.service';
import { CacheController } from './CacheController.controller';

@Module({
  imports: [forwardRef(() => DataSetModule)],
  providers: [
    // FileUploadProcessor,
    CacheService,
  ],
  controllers: [CacheController],
  exports: [CacheService],
})
export class CacheModule {}
