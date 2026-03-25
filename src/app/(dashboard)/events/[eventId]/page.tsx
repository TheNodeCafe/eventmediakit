"use client";

import { use } from "react";
import Link from "next/link";
import { useEvent } from "@/hooks/use-events";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Palette,
  Users,
  BarChart3,
  Tag,
} from "lucide-react";

const modules = [
  {
    href: "templates",
    label: "Templates",
    description: "Créez et gérez vos modèles de visuels",
    icon: Palette,
  },
  {
    href: "participants",
    label: "Participants",
    description: "Importez et invitez vos participants",
    icon: Users,
  },
  {
    href: "categories",
    label: "Catégories",
    description: "Gérez les catégories de participants",
    icon: Tag,
  },
  {
    href: "stats",
    label: "Statistiques",
    description: "Suivez les téléchargements et l'engagement",
    icon: BarChart3,
  },
];

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <Badge
              variant={event.status === "active" ? "default" : "secondary"}
            >
              {event.status === "draft"
                ? "Brouillon"
                : event.status === "active"
                  ? "Actif"
                  : "Archivé"}
            </Badge>
          </div>
          {event.start_date && (
            <p className="text-muted-foreground">
              {new Date(event.start_date).toLocaleDateString("fr-FR")}
              {event.end_date &&
                ` - ${new Date(event.end_date).toLocaleDateString("fr-FR")}`}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((mod) => (
          <Link key={mod.href} href={`/events/${eventId}/${mod.href}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <mod.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{mod.label}</CardTitle>
                    <CardDescription>{mod.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
