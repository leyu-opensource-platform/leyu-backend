import { IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsDate,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Custom validator to check if end_date >= start_date
 */
export function EndDateAfterStartDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'endDateAfterStartDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: Date, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!value || !relatedValue) return true;
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `End date cannot be before start date`;
        },
      },
    });
  };
}

/**
 * Custom validator to ensure start_date is not in the past
 */
export function NotInPast(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'notInPast',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date) {
          if (!value) return true;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return value >= yesterday;
        },
        defaultMessage() {
          return `Start date cannot be in the past`;
        },
      },
    });
  };
}

/**
 * Assign Project Manager DTO
 */
export class AssignProjectManagerDto {
  @IsEmail()
  email: string;

  @IsUUID()
  project_id: string;
}

/**
 * Create Project DTO
 */
export class CreateProjectDto {
  @ApiPropertyOptional({
    description: 'Name of the project',
  })
  @IsString()
  @MinLength(1, { message: 'Project name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the project',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Start date of the project',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Invalid date format' })
  @NotInPast({ message: 'Start date cannot be in the past' })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'End date of the project',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Invalid date format' })
  @EndDateAfterStartDate('start_date', {
    message: 'End date cannot be before start date',
  })
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Email of the project manager',
    example: 'G2d3s@example.com',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEmail({}, { message: 'Invalid email format' })
  manager_email: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the project',
    example: ['tag1', 'tag2'],
    required: false,
  })
  @IsString()
  @IsOptional()
  tags: string;
}

/**
 * Update Project DTO
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Project name is required' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Invalid date format' })
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Invalid date format' })
  @EndDateAfterStartDate('start_date', {
    message: 'End date cannot be before start date',
  })
  end_date?: Date;

  @IsOptional()
  @IsEnum(['Active', 'InActive'])
  status: 'Active' | 'InActive';

  @ApiPropertyOptional({
    description: 'Tags associated with the project',
    example: ['tag1', 'tag2'],
    required: false,
  })
  @IsString()
  @IsOptional()
  tags: string;
}

export class GetProjectsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by project name (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by manager ID (UUID)' })
  @IsOptional()
  @IsUUID()
  manager_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['Active', 'InActive'],
  })
  @IsOptional()
  @IsEnum(['Active', 'InActive'])
  status?: string;

  @ApiPropertyOptional({ description: 'Search by project name or tags' })
  @IsOptional()
  search?: string;
}
