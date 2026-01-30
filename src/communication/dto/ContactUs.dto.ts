import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
export const createContactUsSchema = z.object({
  content: z.string().min(1),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().min(1),
});
export const updateContactUsSchema = z.object({
  content: z.string().min(1).optional(),
  email: z.string().email().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone_number: z.string().min(1).optional(),
});
export class CreateContactUsDto extends createZodDto(createContactUsSchema) {}
export class UpdateContactUsDto extends createZodDto(updateContactUsSchema) {}
