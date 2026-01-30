import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
export class CreateTaskInstructionDto {
  @ApiProperty({ description: 'Title of the task instruction' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Content of the task instruction',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'URL of the video instruction', required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  video_instruction_url?: string;

  @ApiProperty({ description: 'URL of the audio instruction', required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  audio_instruction_url?: string;
}
export class UpdateTaskInstructionDto {
  @ApiProperty({ description: 'Title of the task instruction' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Content of the task instruction',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'URL of the video instruction', required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  video_instruction_url?: string;

  @ApiProperty({ description: 'URL of the audio instruction', required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  audio_instruction_url?: string;
}
