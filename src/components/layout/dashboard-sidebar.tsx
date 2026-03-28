"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import {
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col md:flex bg-[oklch(0.15_0.03_264)] text-[oklch(0.85_0.01_264)]">
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 border-b border-white/[0.06] px-5">
        <Link href="/events" className="flex items-center gap-2.5 font-semibold text-white tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.488_0.243_264.376)] shadow-lg shadow-[oklch(0.488_0.243_264.376)]/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px]">EventMediaKit</span>
        </Link>
      </div>

      {/* Navigation */}
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
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              )}
            >
              <item.icon className={cn(
                "h-[18px] w-[18px] transition-colors",
                isActive ? "text-[oklch(0.75_0.15_264)]" : "text-white/40 group-hover:text-white/60"
              )} />
              {t("dashboard", item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-5 py-4">
        <p className="text-[11px] text-white/20">{t("dashboard", "version")}</p>
      </div>
    </aside>
  );
}
