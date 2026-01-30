import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { createZodDto } from 'nestjs-zod';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { z } from 'zod';
export class CreateFlagTypeDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  description?: string;
}
export const createRejectionTypeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export class CreateRejectionTypeDto extends createZodDto(
  createRejectionTypeSchema,
) {}
export class UpdateRejectionTypeDto extends createZodDto(
  createRejectionTypeSchema,
) {}
