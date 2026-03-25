"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardHeader() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div />
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
        <LogOut className="mr-2 h-4 w-4" />
        Déconnexion
      </Button>
    </header>
  );
}
