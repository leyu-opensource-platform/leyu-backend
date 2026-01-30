import { Injectable } from '@nestjs/common';
import { DataSetService } from 'src/data_set/service/DataSet.service';
import { MicroTaskService } from 'src/data_set/service/MicroTask.service';
import { DataSetType } from 'src/utils/constants/Task.constant';

@Injectable()
export class ReviewerStatistics {
  constructor(
    private readonly dataSetService: DataSetService,
    private readonly microTaskService: MicroTaskService,
  ) {}
  async getReviewStatistics(reviewerId: string) {
    const textDataSet = await this.dataSetService.countByOptions({
      reviewer_id: reviewerId,
      type: DataSetType.TEXT,
    });
    const audioDataSet = await this.dataSetService.countByOptions({
      reviewer_id: reviewerId,
      type: DataSetType.AUDIO,
    });
    const totalDataSet = textDataSet + audioDataSet;
    return { textDataSet, audioDataSet, totalDataSet };
  }
}
