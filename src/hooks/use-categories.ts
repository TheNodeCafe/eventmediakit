import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ParticipantCategory } from "@/types";

export function useCategories(eventId: string) {
  return useQuery({
    queryKey: ["categories", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/categories`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data as ParticipantCategory[];
    },
  });
}

export function useCreateCategory(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/events/${eventId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data as ParticipantCategory;
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
      const res = await fetch(`/api/events/${eventId}/categories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", eventId] });
    },
  });
}
