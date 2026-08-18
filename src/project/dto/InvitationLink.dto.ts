import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';

/* =======================
   ENUMS
======================= */
export enum Role {
  Contributor = 'Contributor',
  Reviewer = 'Reviewer',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

/* =======================
   INVITATION LINK DTOs
======================= */
export class CreateInvitationLinkDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  expiry_date: Date;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsNumber()
  max_invitations?: number;
}

export class UpdateInvitationLinkDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  expiry_date?: Date;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsNumber()
  max_invitations?: number;
}

/* =======================
   USER DTO
======================= */
export class AcceptInvitationDto {
  @IsString()
  @MinLength(3)
  first_name: string;

  @IsString()
  @MinLength(3)
  middle_name: string;

  @IsString()
  @MinLength(3)
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  birth_date: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  woreda?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  dialect_id?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  language_id: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  region_id?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  zone_id?: string;
}
