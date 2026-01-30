import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createInvitationLinkSchema = z.object({
  expiry_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .transform((val) => new Date(val)),
  role: z.enum(['Contributor', 'Reviewer']).optional(),
  organization_id: z.string().uuid().optional(),
  max_invitations: z.number().optional(),
});

export const updateInvitationLinkSchema = createInvitationLinkSchema.partial();
export const createUserSchema = z
  .object({
    first_name: z.string().min(3),
    middle_name: z.string().min(3),
    last_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    birth_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .transform((val) => new Date(val)),
    gender: z.enum(['Male', 'Female']),
    city: z
      .string()
      .optional()
      .transform((e) => (e === '' ? undefined : e)),
    woreda: z
      .string()
      .optional()
      .transform((e) => (e === '' ? undefined : e)),
    dialect_id: z
      .string()
      .uuid()
      .optional()
      .transform((e) => (e === '' ? undefined : e)),
    language_id: z
      .string()
      .uuid()
      .transform((e) => (e === '' ? undefined : e)),
    region_id: z
      .string()
      .uuid()
      .optional()
      .transform((e) => (e === '' ? undefined : e)),
    zone_id: z
      .string()
      .uuid()
      .optional()
      .transform((e) => (e === '' ? undefined : e)),
  })
  .required();
export class AcceptInvitationDto extends createZodDto(createUserSchema) {}
export class createInvitationLinkDto extends createZodDto(
  createInvitationLinkSchema,
) {}
export class updateInvitationLinkDto extends createZodDto(
  updateInvitationLinkSchema,
) {}
