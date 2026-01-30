import { ApiProperty } from '@nestjs/swagger';
import { MicroTask } from '../entities/MicroTask.entity';
import { DataSet } from '../entities/DataSet.entity';

export class DataSetRto {
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

  @ApiProperty({ type: 'array', isArray: true })
  rejectionReasons: string[];

  @ApiProperty({ isArray: true })
  flagReasons: string[];

  static from(dataSet: DataSet): DataSetRto {
    return {
      id: dataSet.id,
      code: dataSet.code,
      text_data_set: dataSet.text_data_set,
      status: dataSet.status,
      is_test: dataSet.is_test,
      audio_duration: dataSet.audio_duration,
      file_path: dataSet.file_path,
      type: dataSet.type,
      created_date: dataSet.created_date,
      annotation: dataSet.annotation,
      micro_task_id: dataSet.micro_task_id,
      rejectionReasons: dataSet.rejectionReasons
        ? dataSet?.rejectionReasons.map(
            (rejectionReason) => rejectionReason.reason,
          )
        : [],
      flagReasons: dataSet.flagReason
        ? dataSet?.flagReason.map(
            (flagReason) => flagReason.reason || flagReason.comment,
          )
        : [],
    };
  }
}
export class MicroTaskRto {
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

  @ApiProperty()
  current_retry: number;

  @ApiProperty()
  allowed_retry: number;

  @ApiProperty()
  acceptance_status: string;

  @ApiProperty()
  can_retry: boolean;

  @ApiProperty({ type: [DataSetRto] })
  dataSets: DataSetRto[];

  static from(
    microTask: MicroTask,
    metadata: {
      current_retry: number;
      allowed_retry: number;
      acceptance_status: string;
      can_retry: boolean;
    },
  ): MicroTaskRto {
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
      dataSets: microTask.dataSets.map((dataSet) => DataSetRto.from(dataSet)),
      current_retry: metadata.current_retry,
      allowed_retry: metadata.allowed_retry,
      acceptance_status: metadata.acceptance_status,
      can_retry: metadata.can_retry,
    };
  }
}
export class MicroTaskForContributorRto {
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

  @ApiProperty({ type: [DataSetRto] })
  dataSets: DataSetRto[];

  static from(microTask: MicroTask): MicroTaskForContributorRto {
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
      dataSets: microTask.dataSets.map((dataSet) => DataSetRto.from(dataSet)),
    };
  }
}
