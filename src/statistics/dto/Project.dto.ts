import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ProjectStatisticsDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiProperty({ enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] })
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'])
  view_type: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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
