"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2, Lock, CheckCircle, ImageIcon, Sparkles } from "lucide-react";
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
  const b = event.branding as Record<string, unknown>;
  const primaryColor = (b?.primary_color || org.primary_color) as string | undefined;
  const headerImageUrl = b?.header_image_url as string | undefined;
  const logoUrl = (b?.logo_url || org.logo_url) as string | undefined;
  const showDates = b?.show_dates !== false;
  const showDescription = b?.show_description !== false;
  const showOrgName = b?.show_org_name !== false;

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
      // Track generation for quota (fire and forget)
      fetch("/api/render/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          template_id: activeTemplate.id,
        }),
      }).catch(() => {});

      // Render client-side via Fabric.js
      await clientSideDownload();
    } catch {
      console.warn("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function clientSideDownload() {
    const { StaticCanvas, FabricImage, Pattern } = await import("fabric");
    const canvas = new StaticCanvas(undefined, {
      width: activeTemplate!.width,
      height: activeTemplate!.height,
    });

    await canvas.loadFromJSON(activeTemplate!.canvas_json);

    // Inject field values (text + images)
    for (const obj of canvas.getObjects()) {
      const typed = obj as unknown as Record<string, unknown>;
      const vf = typed.variableField as string | undefined;
      if (!vf || !fieldValues[vf]) continue;

      const value = fieldValues[vf];

      if (typed.text !== undefined) {
        (obj as { set: (k: string, v: unknown) => void }).set("text", value);
      } else if (value.startsWith("blob:") || value.startsWith("data:") || value.startsWith("http")) {
        try {
          const img = await FabricImage.fromURL(value);
          const shapeW = (typed.radius as number) ? (typed.radius as number) * 2 : (typed.width as number) ?? 100;
          const shapeH = (typed.radius as number) ? (typed.radius as number) * 2 : (typed.height as number) ?? 100;
          const imgScale = Math.max(shapeW / (img.width ?? 1), shapeH / (img.height ?? 1));
          img.set({ scaleX: imgScale, scaleY: imgScale, originX: "center", originY: "center", left: shapeW / 2, top: shapeH / 2 } as never);
          (obj as { set: (k: string, v: unknown) => void }).set("fill", new Pattern({ source: img.toCanvasElement(), repeat: "no-repeat" }));
        } catch (e) {
          console.warn("Image fill failed:", e);
        }
      }
    }
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
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor ?? "#1e1b4b"} 0%, ${primaryColor ? primaryColor + "dd" : "#312e81"} 50%, ${primaryColor ? primaryColor + "99" : "#4338ca"} 100%)`,
        }}
      >
        <Card className="w-full max-w-sm border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              {org.logo_url ? (
                <img
                  src={org.logo_url}
                  alt=""
                  className="mx-auto mb-5 h-14 object-contain"
                />
              ) : (
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: primaryColor ?? "#6366f1" }}
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold tracking-tight">{event.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Entrez le mot de passe pour accéder au media kit
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    className="h-11 rounded-xl pl-10 text-[15px]"
                  />
                </div>
                {passwordError && (
                  <p className="text-[13px] font-medium text-destructive">
                    Mot de passe incorrect
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl text-[15px] font-semibold shadow-lg"
                style={
                  primaryColor
                    ? { backgroundColor: primaryColor }
                    : undefined
                }
              >
                Accéder au media kit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero header */}
      <header
        className="relative overflow-hidden"
        style={
          headerImageUrl
            ? {
                backgroundImage: `url(${headerImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { backgroundColor: primaryColor ?? "#1e1b4b" }
        }
      >
        {/* Overlay for image backgrounds */}
        {headerImageUrl && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${primaryColor ?? "#1e1b4b"}77` }}
          />
        )}
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={org.name}
                  className="h-16 rounded-xl object-contain shadow-lg"
                />
              )}
              <div className="text-white">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{event.name}</h1>
                {showDates && event.start_date && (
                  <p className="mt-1.5 text-sm font-medium text-white/60">
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
            <div className="text-white/90">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">MEDIAKIT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      {showDescription && event.description && (
        <div className="border-b border-border/30 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <p className="text-center text-[15px] text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        </div>
      )}

      {/* Category tabs */}
      {hasCategories && someTemplatesHaveCategories && (
        <div className="border-b border-border/30 bg-white">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-200",
                  activeCategory === cat.id
                    ? "text-white shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={
                  activeCategory === cat.id
                    ? {
                        backgroundColor: primaryColor ?? "#6366f1",
                        boxShadow: `0 4px 14px ${primaryColor ?? "#6366f1"}33`,
                      }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Heading */}
            <div>
              <h2 className="text-lg font-bold tracking-tight">Personnalisez votre visuel</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Remplissez les champs ci-dessous pour personnaliser votre bannière
              </p>
            </div>

            {/* Format/template selector */}
            {categoryTemplates.length > 1 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
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
                          "flex flex-col items-center rounded-xl border-2 p-3.5 transition-all duration-200",
                          isActive
                            ? "border-primary/80 bg-primary/5 shadow-sm"
                            : "border-border/50 bg-white hover:border-primary/30 hover:shadow-sm"
                        )}
                      >
                        <div
                          className="mb-2 rounded-md bg-muted/60"
                          style={{
                            width: 60,
                            height: 60 * (t.height / t.width),
                            maxHeight: 80,
                          }}
                        />
                        <span className="text-[12px] font-semibold">
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
                  <Label className="flex items-center gap-1.5 text-[13px] font-semibold">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  {field.field_type === "textarea" ? (
                    <Textarea
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      placeholder={`Saisissez votre ${field.label.toLowerCase()}`}
                      className="min-h-[90px] rounded-xl bg-white text-[14px] shadow-sm resize-none"
                    />
                  ) : field.field_type === "image" ? (
                    <div className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-white p-6 transition-all hover:border-primary/40 hover:bg-primary/[0.02]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 transition-colors group-hover:bg-primary/10">
                        <ImageIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                      </div>
                      <p className="mt-3 text-[13px] font-medium">
                        Déposez votre image ici ou{" "}
                        <label className="cursor-pointer font-semibold text-primary hover:text-primary/80">
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
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        PNG, SVG, JPG, GIF
                      </p>
                      {fieldValues[field.name] && (
                        <img
                          src={fieldValues[field.name]}
                          alt=""
                          className="mt-4 h-20 rounded-lg object-contain shadow-sm"
                        />
                      )}
                    </div>
                  ) : (
                    <Input
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      placeholder={`Saisissez votre ${field.label.toLowerCase()}`}
                      className="h-11 rounded-xl bg-white text-[14px] shadow-sm"
                    />
                  )}
                </div>
              ))}

              {/* Download button */}
              {activeTemplate && (
                <Button
                  size="lg"
                  className="h-12 w-full rounded-xl text-[15px] font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                  onClick={handleDownload}
                  disabled={downloading}
                  style={
                    primaryColor
                      ? {
                          backgroundColor: primaryColor,
                          boxShadow: `0 8px 24px ${primaryColor}33`,
                        }
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
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-muted-foreground">Aperçu en direct</span>
                  <span className="rounded-full bg-muted/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {FORMAT_PRESETS[activeTemplate.format as TemplateFormat]
                      ?.label ?? activeTemplate.format}{" "}
                    ({activeTemplate.width}x{activeTemplate.height})
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border/30 bg-white shadow-lg">
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
              <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-border/30 bg-white">
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-[13px] text-muted-foreground/60">
                    {templates.length === 0
                      ? "Aucun template publié pour cet événement"
                      : "Remplissez les champs pour voir l'aperçu"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between text-[12px] text-muted-foreground/40">
            <span>Propulsé par EventMediaKit</span>
            {showOrgName && <span>{org.name}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
