import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createLanguageSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
});
export const updateLanguageSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
});
export class CreateLanguageDto extends createZodDto(createLanguageSchema) {}
export class UpdateLanguageDto extends createZodDto(updateLanguageSchema) {}
