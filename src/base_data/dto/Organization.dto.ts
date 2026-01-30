import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createOrganizationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
const updateOrganizationSchema = createOrganizationSchema.partial();

export class CreateOrganizationDto extends createZodDto(
  createOrganizationSchema,
) {}
export class UpdateOrganizationDto extends createZodDto(
  updateOrganizationSchema,
) {}
