import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
export const createRejectionReasonSchema = z.object({
  reason: z.string().min(1),
  comment: z.string(),
  rejection_type_id: z.string().uuid(),
});

export class CreateRejectionReasonDto {
  @ApiProperty({})
  @IsString()
  comment: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value); // fallback
  })
  flag: boolean;

  @ApiProperty()
  @IsArray()
  rejection_type_ids: string[];
}

export class UpdateRejectionReasonDto {
  @ApiProperty({ type: 'array' })
  reason?: string[];

  @ApiProperty({})
  comment?: string;

  @ApiProperty({})
  rejection_type_id?: string[];
}
export class FlagReasonDto {
  @ApiProperty({ required: false })
  @IsOptional()
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  comment: string;

  @ApiProperty({ required: true })
  @IsUUID()
  flag_type_id: string;
}
