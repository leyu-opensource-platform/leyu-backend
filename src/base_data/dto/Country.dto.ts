import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  continent: z.string().min(1).optional(),
});
export const updateCountrySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  continent: z.string().min(1).optional(),
});
export class CreateCountryDto extends createZodDto(createCountrySchema) {}
export class UpdateCountryDto extends createZodDto(updateCountrySchema) {}
export class SearchCountryDto extends createZodDto(updateCountrySchema) {}
