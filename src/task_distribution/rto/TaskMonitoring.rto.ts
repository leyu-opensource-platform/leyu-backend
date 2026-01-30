import { ApiProperty } from '@nestjs/swagger';

export class TaskDataSetReviewerDistributionRto {
  @ApiProperty()
  totalAssignedDataSets: number;
  @ApiProperty()
  totalReviewedDataSets: number;
  @ApiProperty()
  totalUnAssignedDataSets: number;
}
export class TaskReviewersProgressRto {
  @ApiProperty()
  reviewer_id: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;

  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  reviewed_count: number;
  @ApiProperty()
  pending_count: number;
}
