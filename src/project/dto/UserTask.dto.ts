import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsUUID } from 'class-validator';
export class AssignContributorToFacilitatorToTaskDto {
  @ApiProperty({})
  @IsUUID()
  facilitator_id: string;
  @ApiProperty({})
  @IsArray()
  contributor_ids: string[];
}
export class AssignUserToTaskDto {
  @ApiProperty()
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
export class AssignContributorToTaskDto {
  @ApiProperty({})
  @IsArray()
  contributor_ids: string[];
}
export class ActivateToggleDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;
}

export class RemoveContributorFromFacilitatorDto {
  @ApiProperty({})
  @IsArray()
  contributor_ids: string[];

  @ApiProperty({})
  @IsUUID()
  task_id: string;
}
