"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Settings,
  CreditCard,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/settings", label: "Paramètres", icon: Settings },
  { href: "/billing", label: "Facturation", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 md:block bg-[oklch(0.2_0.04_264)] text-[oklch(0.85_0.01_264)]">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-6">
        <Link href="/events" className="flex items-center gap-2.5 font-bold text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.488_0.243_264.376)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base">EventMediaKit</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Branding footer */}
      <div className="mt-auto border-t border-white/10 p-4">
        <p className="text-xs text-white/30">EventMediaKit v0.1</p>
      </div>
    </aside>
  );
}
