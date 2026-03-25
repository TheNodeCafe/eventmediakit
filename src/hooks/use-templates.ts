import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Template } from "@/types";

export function useTemplates(eventId: string) {
  return useQuery({
    queryKey: ["templates", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("templates")
        .select("*, template_categories(category_id)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Template & {
        template_categories: { category_id: string }[];
      })[];
    },
  });
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;
      return data as Template;
    },
    enabled: !!templateId,
  });
}

interface SaveTemplateInput {
  name: string;
  canvas_json: Record<string, unknown>;
  format: string;
  width: number;
  height: number;
}

export function useCreateTemplate(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveTemplateInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("templates")
        .insert({
          event_id: eventId,
          name: input.name,
          format: input.format,
          width: input.width,
          height: input.height,
          canvas_json: input.canvas_json,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", eventId] });
    },
  });
}

export function useUpdateTemplate(templateId: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveTemplateInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("templates")
        .update({
          name: input.name,
          format: input.format,
          width: input.width,
          height: input.height,
          canvas_json: input.canvas_json,
        })
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", eventId] });
      queryClient.invalidateQueries({ queryKey: ["template", templateId] });
    },
  });
}

export function useDeleteTemplate(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", eventId] });
    },
  });
}

export function usePublishTemplate(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      status,
    }: {
      templateId: string;
      status: "draft" | "published";
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("templates")
        .update({ status })
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", eventId] });
    },
  });
}
