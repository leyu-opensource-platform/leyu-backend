import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class CreateAnnotationDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  annotation_type_id: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  description?: string;
}

export class CreateAnnotationTypeDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  description?: string;
}
