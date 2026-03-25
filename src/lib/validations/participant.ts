import { z } from "zod/v4";

export const participantSchema = z.object({
  email: z.email("Email invalide"),
  category_id: z.string().uuid("Catégorie requise"),
});

export const participantImportSchema = z.object({
  participants: z.array(participantSchema).min(1, "Au moins un participant"),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;
