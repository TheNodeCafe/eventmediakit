import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Participant } from "@/types";

export function useParticipants(eventId: string) {
  return useQuery({
    queryKey: ["participants", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("participants")
        .select("*, category:participant_categories(name)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Participant & { category: { name: string } })[];
    },
  });
}

interface CreateParticipantInput {
  email: string;
  category_id: string;
}

export function useCreateParticipant(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateParticipantInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("participants")
        .insert({
          event_id: eventId,
          email: input.email,
          category_id: input.category_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Participant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
    },
  });
}

export function useBulkCreateParticipants(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      participants: { email: string; category_id: string }[]
    ) => {
      const supabase = createClient();
      const rows = participants.map((p) => ({
        event_id: eventId,
        email: p.email,
        category_id: p.category_id,
      }));

      const { data, error } = await supabase
        .from("participants")
        .upsert(rows, { onConflict: "event_id,email" })
        .select();

      if (error) throw error;
      return data as Participant[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
    },
  });
}

export function useDeleteParticipant(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
    },
  });
}
