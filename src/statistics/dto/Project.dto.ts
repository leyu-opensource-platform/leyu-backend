import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ProjectStatisticsDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiProperty({ enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] })
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'])
  view_type: 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  // Reference point for the WEEKLY 7-day window / MONTHLY 12-month year --
  // lets the dashboard page to an earlier week/year instead of always
  // showing the window ending today. Defaults to "now" server-side when
  // omitted, preserving the existing behavior.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  anchor_date?: string;
}
export class TaskStatisticsDto {
  @ApiProperty({ enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] })
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'])
  view_type: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}
export class DataSetStatisticsDto {
  @ApiProperty({ enum: ['LANGUAGE', 'DIALECT'] })
  @IsEnum(['LANGUAGE', 'DIALECT'])
  view_type: 'LANGUAGE' | 'DIALECT';
}

export class DataSetStatisticsPerProjectDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  project_id?: string;

  @ApiProperty({ enum: ['LANGUAGE', 'DIALECT'], default: 'LANGUAGE' })
  @IsEnum(['LANGUAGE', 'DIALECT'])
  view_type: 'LANGUAGE' | 'DIALECT';
}
