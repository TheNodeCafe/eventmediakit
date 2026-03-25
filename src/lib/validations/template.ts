import { z } from "zod/v4";

export const templateSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  format: z.enum(["square_1x1", "story_9x16", "landscape_16x9", "linkedin_banner"]),
  canvas_json: z.record(z.string(), z.unknown()).optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
