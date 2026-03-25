"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2, Lock, CheckCircle, ImageIcon } from "lucide-react";
import { TemplatePreview } from "../participant-portal/template-preview";
import { cn } from "@/lib/utils";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat } from "@/types";

interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  field_type: "text" | "image" | "textarea";
  required: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface TemplateData {
  id: string;
  name: string;
  format: string;
  width: number;
  height: number;
  canvas_json: Record<string, unknown>;
  template_categories: { category_id: string }[];
}

interface EventData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  branding: Record<string, unknown>;
  access_password: string | null;
  organization: {
    name: string;
    logo_url: string | null;
    primary_color: string | null;
  };
}

interface PublicEventPageProps {
  event: EventData;
  categories: Category[];
  templates: TemplateData[];
  fieldDefinitions: FieldDefinition[];
}

export function PublicEventPage({
  event,
  categories,
  templates,
  fieldDefinitions,
}: PublicEventPageProps) {
  const [authenticated, setAuthenticated] = useState(!event.access_password);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  const org = event.organization;
  const primaryColor = (org.primary_color || event.branding?.primary_color) as string | undefined;

  // Filter templates by category. Templates with no category association are always shown.
  const hasCategories = categories.length > 0;
  const someTemplatesHaveCategories = templates.some(
    (t) => t.template_categories.length > 0
  );

  const categoryTemplates =
    hasCategories && activeCategory && someTemplatesHaveCategories
      ? templates.filter(
          (t) =>
            t.template_categories.length === 0 ||
            t.template_categories.some((tc) => tc.category_id === activeCategory)
        )
      : templates;

  // Active template for preview
  const activeTemplate = categoryTemplates.find(
    (t) => t.id === activeTemplateId
  ) ?? categoryTemplates[0] ?? null;

  function handleCategoryChange(catId: string) {
    setActiveCategory(catId);
    setActiveTemplateId(null);
    setDownloadDone(false);
  }

  function updateField(name: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === event.access_password) {
      setAuthenticated(true);
    } else {
      setPasswordError(true);
    }
  }

  async function handleDownload() {
    if (!activeTemplate) return;
    setDownloading(true);
    setDownloadDone(false);

    try {
      const res = await fetch("/api/render/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          template_id: activeTemplate.id,
          field_values: fieldValues,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        // Fallback: client-side download via canvas
        await clientSideDownload();
        return;
      }

      // Poll for completion
      const generationId = result.data.generation_id;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(`/api/generations/${generationId}`);
        const statusData = await statusRes.json();

        if (statusData.data?.status === "completed" && statusData.data?.file_url) {
          triggerDownload(statusData.data.file_url);
          setDownloadDone(true);
          return;
        }
        if (statusData.data?.status === "failed") {
          await clientSideDownload();
          return;
        }
      }

      // Timeout — fallback to client-side
      await clientSideDownload();
    } catch {
      await clientSideDownload();
    } finally {
      setDownloading(false);
    }
  }

  async function clientSideDownload() {
    // Fallback: render via Fabric.js in the browser
    const { StaticCanvas } = await import("fabric");
    const canvas = new StaticCanvas(undefined, {
      width: activeTemplate!.width,
      height: activeTemplate!.height,
    });

    await canvas.loadFromJSON(activeTemplate!.canvas_json);

    // Inject field values
    canvas.getObjects().forEach((obj) => {
      const typed = obj as unknown as Record<string, unknown>;
      const vf = typed.variableField as string | undefined;
      if (vf && fieldValues[vf] && typed.text !== undefined) {
        typed.text = fieldValues[vf];
      }
    });
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
    triggerDownload(dataUrl);
    canvas.dispose();
    setDownloadDone(true);
  }

  function triggerDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-visual.png`;
    a.click();
  }

  // Password gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <div className="mb-6 text-center">
              {org.logo_url && (
                <img
                  src={org.logo_url}
                  alt=""
                  className="mx-auto mb-4 h-12 object-contain"
                />
              )}
              <h1 className="text-xl font-bold">{event.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrez le mot de passe pour accéder au media kit
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    className="pl-10"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">
                    Mot de passe incorrect
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Accéder au media kit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with event branding */}
      <header
        className="relative overflow-hidden px-6 py-8 text-white"
        style={{ backgroundColor: primaryColor ?? "#1e1b4b" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            {org.logo_url && (
              <img
                src={org.logo_url}
                alt={org.name}
                className="h-14 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              {event.start_date && (
                <p className="text-sm opacity-80">
                  {new Date(event.start_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {event.end_date &&
                    ` - ${new Date(event.end_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`}
                </p>
              )}
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold tracking-wider">MEDIAKIT</p>
              <p className="text-xs opacity-70">
                Bannières et visuels personnalisables
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      {event.description && (
        <div className="mx-auto max-w-6xl px-6 py-6 text-center">
          <p className="text-muted-foreground">{event.description}</p>
        </div>
      )}

      {/* Category tabs */}
      {hasCategories && someTemplatesHaveCategories && (
        <div className="border-b">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "border-transparent text-white"
                    : "border-border bg-white text-foreground hover:bg-muted"
                )}
                style={
                  activeCategory === cat.id
                    ? { backgroundColor: primaryColor ?? "#6366f1" }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content: form + preview side by side */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Format selector + Form */}
          <div className="space-y-6">
            {/* Format/template selector */}
            {categoryTemplates.length > 1 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-medium">
                  <ImageIcon className="h-4 w-4" />
                  Choisir le format
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categoryTemplates.map((t) => {
                    const preset = FORMAT_PRESETS[t.format as TemplateFormat];
                    const isActive = t.id === (activeTemplate?.id ?? "");
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTemplateId(t.id);
                          setDownloadDone(false);
                        }}
                        className={cn(
                          "flex flex-col items-center rounded-lg border-2 p-3 transition-colors",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div
                          className="mb-2 rounded bg-muted"
                          style={{
                            width: 60,
                            height: 60 * (t.height / t.width),
                            maxHeight: 80,
                          }}
                        />
                        <span className="text-xs font-medium">
                          {preset?.label.split(" (")[0] ?? t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variable fields form */}
            <div className="space-y-4">
              {fieldDefinitions.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  {field.field_type === "textarea" ? (
                    <Textarea
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      placeholder={`Exemple : ${field.label}`}
                    />
                  ) : field.field_type === "image" ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50">
                      <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="mb-1 text-sm font-medium">
                        Déposez votre image ici ou{" "}
                        <label className="cursor-pointer font-semibold underline">
                          parcourir
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/svg+xml"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateField(
                                  field.name,
                                  URL.createObjectURL(file)
                                );
                              }
                            }}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formats supportés : png, svg, jpg, gif
                      </p>
                      {fieldValues[field.name] && (
                        <img
                          src={fieldValues[field.name]}
                          alt=""
                          className="mt-3 h-20 rounded object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <Input
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      placeholder={`Exemple : ${field.label}`}
                    />
                  )}
                </div>
              ))}

              {/* Download button */}
              {activeTemplate && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleDownload}
                  disabled={downloading}
                  style={
                    primaryColor
                      ? { backgroundColor: primaryColor }
                      : undefined
                  }
                >
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Génération en cours...
                    </>
                  ) : downloadDone ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Téléchargé — Retélécharger
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Télécharger le visuel
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            {activeTemplate ? (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aperçu :</span>
                  <span className="font-medium">
                    {FORMAT_PRESETS[activeTemplate.format as TemplateFormat]
                      ?.label ?? activeTemplate.format}{" "}
                    ({activeTemplate.width}x{activeTemplate.height})
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border shadow-sm">
                  <TemplatePreview
                    key={activeTemplate.id}
                    canvasJson={activeTemplate.canvas_json}
                    width={activeTemplate.width}
                    height={activeTemplate.height}
                    fieldValues={fieldValues}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {templates.length === 0
                    ? "Aucun template publié pour cet événement"
                    : "Remplissez les champs pour voir l'aperçu"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
