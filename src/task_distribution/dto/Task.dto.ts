import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/Pagination.dto';

export class GetContributorTasksDto extends PaginationDto {
  @ApiProperty({ required: false, enum: ['RECENT', 'NEW', 'COMPLETED', 'ALL'] })
  @IsOptional()
  @IsEnum(['RECENT', 'NEW', 'COMPLETED', 'ALL'])
  status?: 'RECENT' | 'NEW' | 'COMPLETED' | 'ALL';
}
