import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AttemptsDto {
  @ApiProperty()
  @IsUUID()
  micro_task_id: string;
  @ApiProperty()
  text_data_set: string;
}
export class CreateMultipleDataSetDto {
  @ApiProperty({ type: [AttemptsDto] })
  attempts: AttemptsDto[];
  @ApiProperty()
  is_test: boolean;
}
