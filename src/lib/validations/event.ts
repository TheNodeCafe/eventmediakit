import { z } from "zod/v4";

export const eventSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  locale: z.string().optional(),
  access_password: z.string().optional(),
  branding: z
    .object({
      logo_url: z.string().optional(),
      primary_color: z.string().optional(),
      secondary_color: z.string().optional(),
      cover_url: z.string().optional(),
    })
    .optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
