import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createDialectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  language_id: z.string().uuid(),
});
export const UpdateDialectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  language_id: z.string().uuid().optional(),
});

export class CreateDialectDto extends createZodDto(createDialectSchema) {}
export class UpdateDialectDto extends createZodDto(UpdateDialectSchema) {}
