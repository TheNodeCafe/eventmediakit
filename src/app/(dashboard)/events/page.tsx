"use client";

import Link from "next/link";
import { useEvents } from "@/hooks/use-events";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, ArrowRight } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  archived: "Archivé",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  active: "default",
  archived: "outline",
};

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Événements</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Gérez vos événements et leurs kits média
          </p>
        </div>
        <Link
          href="/events/new"
          className={buttonVariants({
            className: "gap-2 rounded-xl shadow-sm shadow-primary/15 text-[13px] font-semibold h-10 px-4",
          })}
        >
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <div className="h-5 w-32 rounded-md bg-muted" />
                <div className="mt-2 h-4 w-48 rounded-md bg-muted/60" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-24 rounded bg-muted/40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
              <CalendarDays className="h-7 w-7 text-primary/70" />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold text-foreground">Aucun événement</h3>
            <p className="mb-6 max-w-[280px] text-center text-sm text-muted-foreground">
              Créez votre premier événement pour commencer à générer des kits média
            </p>
            <Link
              href="/events/new"
              className={buttonVariants({
                className: "gap-2 rounded-xl shadow-sm shadow-primary/15",
              })}
            >
              <Plus className="h-4 w-4" />
              Créer un événement
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="group relative border-border/40 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/70 hover:-translate-y-0.5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-[15px] font-semibold leading-snug">{event.name}</CardTitle>
                    <Badge
                      variant={statusVariants[event.status]}
                      className="shrink-0 text-[11px] font-medium"
                    >
                      {statusLabels[event.status]}
                    </Badge>
                  </div>
                  <CardDescription className="text-[13px]">
                    {event.start_date && (
                      <span>
                        {new Date(event.start_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {event.end_date &&
                          ` — ${new Date(event.end_date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-[12px] font-medium text-primary/70 opacity-0 transition-opacity group-hover:opacity-100">
                    Gérer
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
