import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateBlogSchema = z
  .object({
    title: z.string().min(1),
    author: z.string().min(1),
    full_content: z.string().min(1),
    image_url: z.string(),
    overview: z.string(),
    minutes_to_read: z.number().optional(),
  })
  .required();
export const UpdateBlogSchema = z
  .object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    full_content: z.string().min(1).optional(),
    image_url: z.string().optional(),
    overview: z.string().optional(),
    minutes_to_read: z.number().optional(),
  })
  .required();

export class CreateBlogDto extends createZodDto(CreateBlogSchema) {}
export class UpdateBlogDto extends createZodDto(UpdateBlogSchema) {}
