"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LanguageToggle, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Menu,
  X,
  CalendarDays,
  Settings,
  CreditCard,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/events", labelKey: "events" as const, icon: CalendarDays },
  { href: "/settings", labelKey: "parameters" as const, icon: Settings },
  { href: "/billing", labelKey: "billing" as const, icon: CreditCard },
];

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="flex h-[60px] items-center justify-between border-b border-border/50 bg-white/80 px-4 backdrop-blur-sm md:px-6">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/events" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">EventMediaKit</span>
          </Link>
        </div>

        {/* Desktop: empty left side (sidebar handles nav) */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-[13px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("dashboard", "disconnect")}</span>
          </Button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in menu */}
          <div className="absolute left-0 top-0 h-full w-72 bg-[oklch(0.15_0.03_264)] text-white shadow-2xl">
            {/* Logo */}
            <div className="flex h-[60px] items-center justify-between border-b border-white/[0.06] px-5">
              <Link
                href="/events"
                className="flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-[15px] font-semibold">EventMediaKit</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 p-3 pt-4">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                {t("dashboard", "menu")}
              </p>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all",
                      isActive
                        ? "bg-white/[0.12] text-white"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px]",
                        isActive ? "text-[oklch(0.75_0.15_264)]" : "text-white/40"
                      )}
                    />
                    {t("dashboard", item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            {/* Logout at bottom */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] p-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
              >
                <LogOut className="h-[18px] w-[18px] text-white/40" />
                {t("dashboard", "disconnect")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
