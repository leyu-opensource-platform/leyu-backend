import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReportMicroTaskDto {
  @ApiProperty({ description: 'The micro-task being reported' })
  @IsUUID()
  micro_task_id: string;

  @ApiProperty({
    description: 'Why the prompt is being reported',
    enum: ['nonsensical', 'offensive', 'other'],
  })
  @IsEnum(['nonsensical', 'offensive', 'other'])
  reason: 'nonsensical' | 'offensive' | 'other';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
