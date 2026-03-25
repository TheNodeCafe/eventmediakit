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
import { Plus, CalendarDays } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Événements</h1>
          <p className="text-muted-foreground">
            Gérez vos événements et leurs kits média
          </p>
        </div>
        <Link href="/events/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">Aucun événement</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Créez votre premier événement pour commencer
            </p>
            <Link href="/events/new" className={buttonVariants()}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un événement
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant={statusVariants[event.status]}>
                      {statusLabels[event.status]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {event.start_date && (
                      <span>
                        {new Date(event.start_date).toLocaleDateString("fr-FR")}
                        {event.end_date &&
                          ` - ${new Date(event.end_date).toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
