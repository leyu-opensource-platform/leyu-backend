import { IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from './Pagination.dto';

export class ActivityLogDto extends PaginationDto {
  @ApiProperty({
    description: 'Start date for activity log filter',
    example: '2022-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiProperty({
    description: 'End date for activity log filter',
    example: '2022-01-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;
}
