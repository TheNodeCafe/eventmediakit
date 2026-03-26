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
    <header className="flex h-[60px] items-center justify-between border-b border-border/50 bg-white/80 backdrop-blur-sm px-6">
      <div />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2 text-[13px] font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Déconnexion
      </Button>
    </header>
  );
}
