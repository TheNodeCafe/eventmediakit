"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useEvent } from "@/hooks/use-events";
import { useQueryClient } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
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
  ExternalLink,
  Copy,
  ArrowRight,
  PaintBucket,
} from "lucide-react";

const modules = [
  {
    href: "templates",
    label: "Templates",
    description: "Créez et gérez vos modèles de visuels",
    icon: Palette,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    href: "participants",
    label: "Participants",
    description: "Importez et invitez vos participants",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    href: "categories",
    label: "Catégories",
    description: "Gérez les catégories de participants",
    icon: Tag,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    href: "settings",
    label: "Personnalisation",
    description: "Couleurs, logo, image de fond de la page publique",
    icon: PaintBucket,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    href: "stats",
    label: "Statistiques",
    description: "Suivez les téléchargements et l'engagement",
    icon: BarChart3,
    color: "bg-emerald-500/10 text-emerald-600",
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
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted/60" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-border/40 shadow-sm">
              <CardHeader>
                <div className="h-5 w-32 rounded-md bg-muted" />
                <div className="mt-1 h-4 w-48 rounded-md bg-muted/60" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "h-9 w-9 rounded-lg shrink-0",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-[22px] font-bold tracking-tight">{event.name}</h1>
            <Badge
              variant={event.status === "active" ? "default" : "secondary"}
              className="shrink-0 text-[11px] font-medium"
            >
              {event.status === "draft"
                ? "Brouillon"
                : event.status === "active"
                  ? "Actif"
                  : "Archivé"}
            </Badge>
            <StatusToggle eventId={eventId} currentStatus={event.status} />
          </div>
          {event.start_date && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {new Date(event.start_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {event.end_date &&
                ` — ${new Date(event.end_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`}
            </p>
          )}
        </div>
      </div>

      {/* Public URL card */}
      <Card className="border-border/40 bg-muted/30 shadow-sm">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">URL publique du media kit</p>
            <p className="mt-0.5 truncate font-mono text-[13px] text-muted-foreground">
              {typeof window !== "undefined" ? window.location.origin : ""}/e/{event.slug}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg text-[12px] font-medium h-8 border-border/60"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/e/${event.slug}`
                );
              }}
            >
              <Copy className="h-3 w-3" />
              Copier
            </Button>
            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5 rounded-lg text-[12px] font-medium h-8 border-border/60",
              })}
            >
              <ExternalLink className="h-3 w-3" />
              Ouvrir
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Module cards */}
      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Modules
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((mod) => (
            <Link key={mod.href} href={`/events/${eventId}/${mod.href}`}>
              <Card className="group border-border/40 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/70 hover:-translate-y-0.5">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mod.color}`}>
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-[14px] font-semibold">{mod.label}</CardTitle>
                      <CardDescription className="mt-0.5 text-[13px] leading-relaxed">
                        {mod.description}
                      </CardDescription>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/60 group-hover:translate-x-0.5" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusToggle({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  async function toggle() {
    setLoading(true);
    const newStatus = currentStatus === "active" ? "draft" : "active";
    await fetch(`/api/events/${eventId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="ml-auto h-8 rounded-lg text-[12px] font-medium border-border/60"
    >
      {currentStatus === "active" ? "Désactiver" : "Activer"}
    </Button>
  );
}
