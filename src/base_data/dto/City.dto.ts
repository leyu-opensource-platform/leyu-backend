import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  region_id: z.string().uuid(),
});
export const updateCitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  zone_id: z.string().uuid().optional(),
});
export const searchCitySchema = z.object({
  name: z.string().optional(),
});

export class UpdateCityDto extends createZodDto(updateCitySchema) {}
export class CreateCityDto extends createZodDto(createCitySchema) {}
export class SearchCityDto extends createZodDto(searchCitySchema) {}
