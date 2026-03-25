import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/store/org-store";
import type { Event } from "@/types";
import type { EventFormData } from "@/lib/validations/event";

export function useEvents() {
  const org = useOrgStore((s) => s.org);

  return useQuery({
    queryKey: ["events", org?.id],
    queryFn: async () => {
      if (!org) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!org,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data as Event;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const org = useOrgStore((s) => s.org);

  return useMutation({
    mutationFn: async (formData: EventFormData) => {
      if (!org) throw new Error("No organization");
      const supabase = createClient();

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data, error } = await supabase
        .from("events")
        .insert({
          ...formData,
          organization_id: org.id,
          slug,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Partial<EventFormData>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .update(formData)
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
