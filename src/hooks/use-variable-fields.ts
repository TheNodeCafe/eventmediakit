import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { VariableFieldDefinition, FieldType } from "@/types";

export function useVariableFields(eventId: string) {
  return useQuery({
    queryKey: ["variable-fields", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("variable_field_definitions")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order");

      if (error) throw error;
      return data as VariableFieldDefinition[];
    },
  });
}

interface CreateFieldInput {
  name: string;
  label: string;
  field_type: FieldType;
  required: boolean;
}

export function useCreateVariableField(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFieldInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("variable_field_definitions")
        .insert({ event_id: eventId, ...input })
        .select()
        .single();

      if (error) throw error;
      return data as VariableFieldDefinition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["variable-fields", eventId],
      });
    },
  });
}

export function useDeleteVariableField(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("variable_field_definitions")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["variable-fields", eventId],
      });
    },
  });
}
