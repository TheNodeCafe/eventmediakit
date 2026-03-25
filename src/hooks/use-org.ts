import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/store/org-store";
import { useEffect } from "react";

export function useOrg() {
  const { setOrg } = useOrgStore();

  const query = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("organization_members")
        .select("organization:organizations(*)")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return (data as Record<string, unknown>).organization as Record<string, unknown>;
    },
  });

  useEffect(() => {
    if (query.data) {
      setOrg(query.data as never);
    }
  }, [query.data, setOrg]);

  return query;
}
