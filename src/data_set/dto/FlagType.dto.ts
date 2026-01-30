import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateFlagTypeDto {
  @ApiProperty({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  reason: string;
}

export class UpdateFlagTypeDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
