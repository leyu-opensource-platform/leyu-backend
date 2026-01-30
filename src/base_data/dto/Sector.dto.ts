import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createSectorSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateSectorSchema = createSectorSchema.partial();

export class CreateSectorDto extends createZodDto(createSectorSchema) {}
export class UpdateSectorDto extends createZodDto(updateSectorSchema) {}
