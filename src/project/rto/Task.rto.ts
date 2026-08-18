import { ApiProperty } from '@nestjs/swagger';
import { UserTaskStatus } from 'src/utils/constants/Task.constant';

export class TaskMembersListResponseDto {
  @ApiProperty()
  membership_id: string;
  @ApiProperty()
  id: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  is_active: boolean;
  @ApiProperty()
  score: number;
  @ApiProperty({
    description:
      "Count of this contributor's audio submissions to this task, any status (excludes drafts and test-batch clips)",
  })
  submission_count: number;
  @ApiProperty()
  status: UserTaskStatus;

  @ApiProperty()
  referral_code: string;

  @ApiProperty()
  role: string;
}
