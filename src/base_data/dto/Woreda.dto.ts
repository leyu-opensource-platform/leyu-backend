import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createWoredaSchema = z.object({
  name: z.string().min(1),
  zone_id: z.string().uuid(),
});

export const updateWoredaSchema = z.object({
  name: z.string().min(1).optional(),
  zone_id: z.string().uuid().optional(),
});

export class CreateWoredaDto extends createZodDto(createWoredaSchema) {}
export class UpdateWoredaDto extends createZodDto(updateWoredaSchema) {}
