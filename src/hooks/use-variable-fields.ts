import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VariableFieldDefinition, FieldType } from "@/types";

export function useVariableFields(eventId: string) {
  return useQuery({
    queryKey: ["variable-fields", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/fields`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data as VariableFieldDefinition[];
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
      const res = await fetch(`/api/events/${eventId}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data as VariableFieldDefinition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variable-fields", eventId] });
    },
  });
}

export function useDeleteVariableField(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const res = await fetch(`/api/events/${eventId}/fields`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variable-fields", eventId] });
    },
  });
}
