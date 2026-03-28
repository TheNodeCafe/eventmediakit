"use client";

import { use } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Palette,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTemplates, useDeleteTemplate, usePublishTemplate } from "@/hooks/use-templates";
import { useI18n } from "@/lib/i18n/context";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat } from "@/types";

export default function TemplatesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useTemplates(eventId);
  const deleteTemplate = useDeleteTemplate(eventId);
  const publishTemplate = usePublishTemplate(eventId);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${eventId}`}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("templatesPage", "title")}</h1>
            <p className="text-muted-foreground">
              {t("templatesPage", "subtitle")}
            </p>
          </div>
        </div>
        <Link
          href={`/events/${eventId}/templates/new/editor`}
          className={buttonVariants()}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("templatesPage", "newTemplate")}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !templates?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">{t("templatesPage", "noTemplates")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("templatesPage", "noTemplatesDesc")}
            </p>
            <Link
              href={`/events/${eventId}/templates/new/editor`}
              className={buttonVariants()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("templatesPage", "createFirst")}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const preset =
              FORMAT_PRESETS[template.format as TemplateFormat];
            return (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {preset?.label ?? template.format} -{" "}
                        {template.width}x{template.height}
                      </p>
                    </div>
                    <Badge
                      variant={
                        template.status === "published"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {template.status === "published"
                        ? t("templatesPage", "published")
                        : t("templatesPage", "draft")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="group relative mb-4 flex items-center justify-center overflow-hidden rounded bg-muted"
                    style={{
                      aspectRatio: `${template.width}/${template.height}`,
                      maxHeight: 200,
                    }}
                  >
                    {template.thumbnail_url ? (
                      <img src={template.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Palette className="h-8 w-8 text-muted-foreground/50" />
                    )}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-xs font-medium">
                        {template.thumbnail_url ? t("templatesPage", "changeCover") : t("templatesPage", "addCover")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const url = reader.result as string;
                            await fetch("/api/templates/thumbnail", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ template_id: template.id, thumbnail_url: url }),
                            });
                            queryClient.invalidateQueries({ queryKey: ["templates", eventId] });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/events/${eventId}/templates/${template.id}/editor`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {t("templatesPage", "edit")}
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        publishTemplate.mutate({
                          templateId: template.id,
                          status:
                            template.status === "published"
                              ? "draft"
                              : "published",
                        })
                      }
                    >
                      {template.status === "published"
                        ? t("templatesPage", "unpublish")
                        : t("templatesPage", "publish")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(t("templatesPage", "deleteConfirm"))) {
                          deleteTemplate.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
