import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { PaginationDto } from 'src/common/dto/Pagination.dto';

export class CreateRegionDto {
  @ApiProperty()
  @IsString()
  @Length(1)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  country_id: string;
}
export class UpdateRegionDto {
  @ApiProperty({ required: false })
  @IsString()
  @Length(2)
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  country_id?: string;
}

export class SearchRegionDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(4)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  country_id?: string;
}
