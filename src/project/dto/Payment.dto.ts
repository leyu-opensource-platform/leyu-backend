import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskPaymentDto {
  @IsString()
  @IsNotEmpty()
  task_id: string;

  @IsNumber()
  contributor_credit_per_microtask: number;

  @IsNumber()
  reviewer_credit_per_microtask: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}
