import { ApiProperty } from '@nestjs/swagger';
import { DataSet } from './entities/DataSet.entity';
import { FlagReason } from './entities/FlagReason.entity';
import { MicroTask } from './entities/MicroTask.entity';
import { RejectionReason } from './entities/RejectionReason.entity';
import { UserSanitize } from 'src/auth/sanitize';

export class MicroTaskSanitize {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  is_test: boolean;

  @ApiProperty()
  instruction: string;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_date: Date;
  static from(microTask: MicroTask) {
    return {
      id: microTask.id,
      code: microTask.code,
      is_test: microTask.is_test,
      instruction: microTask.instruction,
      file_path: microTask.file_path,
      text: microTask.text,
      type: microTask.type,
      status: microTask.status,
      created_date: microTask.created_date,
    };
  }
}
export const DataSetSanitizeFields = {
  id: true,
  code: true,
  text_data_set: true,
  status: true,
  is_test: true,
  audio_duration: true,
  file_path: true,
  type: true,
  micro_task_id: true,
  annotation: true,
  created_date: true,
};
export class DataSetSanitize {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  text_data_set: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  is_test: boolean;

  @ApiProperty()
  is_flagged: boolean;

  @ApiProperty()
  audio_duration: number;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  annotation: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  micro_task_id: string;

  @ApiProperty({ type: MicroTaskSanitize })
  microTask?: MicroTaskSanitize;

  rejectionReasons?: RejectionReasonSanitize[];
  flagReasons?: FlagReasonSanitize[];
  reviewer?: UserSanitize;
  static from(dataSet: DataSet) {
    return {
      id: dataSet.id,
      code: dataSet.code,
      text_data_set: dataSet.text_data_set,
      status: dataSet.status,
      is_test: dataSet.is_test,
      is_flagged: dataSet.is_flagged,
      audio_duration: dataSet.audio_duration,
      file_path: dataSet.file_path,
      type: dataSet.type,
      created_date: dataSet.created_date,
      annotation: dataSet.annotation,
      micro_task_id: dataSet.micro_task_id,
      microTask: dataSet.microTask && MicroTaskSanitize.from(dataSet.microTask),
      rejectionReasons: dataSet.rejectionReasons
        ? dataSet?.rejectionReasons.map((rejectionReason) =>
            RejectionReasonSanitize.from(rejectionReason),
          )
        : undefined,
      flagReasons: dataSet.flagReason
        ? dataSet?.flagReason.map((flagReason) =>
            FlagReasonSanitize.from(flagReason),
          )
        : undefined,
      reviewer: dataSet.reviewer
        ? UserSanitize.from(dataSet.reviewer)
        : undefined,
    };
  }
}
export const FlagReasonSanitizeFields = {
  id: true,
  reason: true,
  comment: true,
  created_date: true,
};
export class FlagReasonSanitize {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reason?: string;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  created_date: Date;
  static from(flagReason: FlagReason) {
    return {
      id: flagReason.id,
      reason: flagReason.flagType?.name,
      comment: flagReason.comment,
      created_date: flagReason.created_date,
    };
  }
}

export const MicroTaskSanitizeFields = {
  id: true,
  code: true,
  is_test: true,
  instruction: true,
  file_path: true,
  text: true,
  type: true,
  status: true,
  created_date: true,
};

export const RejectionReasonSanitizeFields = {
  id: true,
  reason: true,
  comment: true,
  created_date: true,
};
export class RejectionReasonSanitize {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  rejectionReason?: string;

  static from(rejectionReason: RejectionReason) {
    return {
      id: rejectionReason.id,
      reason: rejectionReason.rejectionType?.name,

      comment: rejectionReason.comment,
      created_date: rejectionReason.created_date,
    };
  }
}
