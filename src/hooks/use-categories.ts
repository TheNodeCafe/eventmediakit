import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ParticipantCategory } from "@/types";

export function useCategories(eventId: string) {
  return useQuery({
    queryKey: ["categories", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("participant_categories")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order");

      if (error) throw error;
      return data as ParticipantCategory[];
    },
  });
}

export function useCreateCategory(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const supabase = createClient();
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data, error } = await supabase
        .from("participant_categories")
        .insert({ event_id: eventId, name, slug })
        .select()
        .single();

      if (error) throw error;
      return data as ParticipantCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", eventId] });
    },
  });
}

export function useDeleteCategory(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("participant_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", eventId] });
    },
  });
}
