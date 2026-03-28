"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, BarChart3 } from "lucide-react";

function useEventStats(eventId: string) {
  return useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: async () => {
      const supabase = createClient();

      // Participants stats
      const { data: participants } = await supabase
        .from("participants")
        .select("id, status, invited_at")
        .eq("event_id", eventId);

      const total = participants?.length ?? 0;
      const invited = participants?.filter((p) => p.invited_at).length ?? 0;
      const opened =
        participants?.filter(
          (p) => p.status === "link_opened" || p.status === "completed"
        ).length ?? 0;
      const completed =
        participants?.filter((p) => p.status === "completed").length ?? 0;

      // Generations stats
      const { data: generations } = await supabase
        .from("generations")
        .select("id, template_id, status, created_at")
        .eq("status", "completed")
        .in(
          "participant_id",
          (participants ?? []).map((p) => p.id)
        );

      const totalGenerations = generations?.length ?? 0;

      // Per-template breakdown
      const { data: templates } = await supabase
        .from("templates")
        .select("id, name")
        .eq("event_id", eventId);

      const templateStats = (templates ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        count: generations?.filter((g) => g.template_id === t.id).length ?? 0,
      }));

      return {
        total,
        invited,
        opened,
        completed,
        totalGenerations,
        templateStats,
      };
    },
  });
}

export default function StatsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: stats, isLoading } = useEventStats(eventId);
  const { t, locale } = useI18n();

  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  const statCards = [
    { label: t("stats", "participants"), value: stats?.total ?? 0 },
    { label: t("stats", "linksSent"), value: stats?.invited ?? 0 },
    { label: t("stats", "linksOpened"), value: stats?.opened ?? 0 },
    { label: t("stats", "downloads"), value: stats?.totalGenerations ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/events/${eventId}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t("stats", "title")}</h1>
          <p className="text-muted-foreground">
            {t("stats", "subtitle")}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? "—" : stat.value.toLocaleString(dateLocale)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-template breakdown */}
      {stats?.templateStats && stats.templateStats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("stats", "perTemplate")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("stats", "template")}</TableHead>
                  <TableHead className="text-right">{t("stats", "downloads")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.templateStats.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">{tpl.name}</TableCell>
                    <TableCell className="text-right">{tpl.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("stats", "noStats")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
