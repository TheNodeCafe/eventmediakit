"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2, Lock, ImageIcon, Sparkles } from "lucide-react";
import { TemplatePreview } from "../participant-portal/template-preview";
import { ImageCropEditor } from "./image-crop-editor";
import { LanguageToggle } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import { extractFontsFromCanvasJson, loadMultipleFonts } from "@/lib/fonts/google-fonts";
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
  thumbnail_url: string | null;
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

// Extract which variable fields are used in a set of templates
function getUsedVariableFields(
  templates: TemplateData[],
  fieldDefinitions: FieldDefinition[]
): FieldDefinition[] {
  const usedFieldNames = new Set<string>();
  templates.forEach((t) => {
    const objects = (t.canvas_json as { objects?: Record<string, unknown>[] })?.objects ?? [];
    objects.forEach((obj) => {
      if (obj.variableField && typeof obj.variableField === "string") {
        usedFieldNames.add(obj.variableField);
      }
    });
  });
  if (usedFieldNames.size === 0) return fieldDefinitions;
  return fieldDefinitions.filter((f) => usedFieldNames.has(f.name));
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [editingImage, setEditingImage] = useState<string | null>(null);

  const org = event.organization;
  const b = event.branding as Record<string, unknown>;
  const primaryColor = (b?.primary_color || org.primary_color) as string | undefined;
  const headerImageUrl = b?.header_image_url as string | undefined;
  const logoUrl = (b?.logo_url || org.logo_url) as string | undefined;
  const showDates = b?.show_dates !== false;
  const showDescription = b?.show_description !== false;
  const showOrgName = b?.show_org_name !== false;
  const showHeaderOverlay = b?.show_header_overlay !== false;

  // Filter templates by category
  const hasCategories = categories.length > 0;
  const someTemplatesHaveCategories = templates.some(
    (t) => t.template_categories.length > 0
  );
  const visibleTemplates =
    hasCategories && activeCategory && someTemplatesHaveCategories
      ? templates.filter(
          (t) =>
            t.template_categories.length === 0 ||
            t.template_categories.some((tc) => tc.category_id === activeCategory)
        )
      : templates;

  // Auto-select first template if none selected
  const selectedTemplate = visibleTemplates.find((t) => t.id === selectedTemplateId)
    ?? visibleTemplates[0] ?? null;

  // Only show fields used by the selected template (not all visible)
  const usedFields = useMemo(
    () => selectedTemplate
      ? getUsedVariableFields([selectedTemplate], fieldDefinitions)
      : [],
    [selectedTemplate, fieldDefinitions]
  );

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

  async function handleDownload(template: TemplateData) {
    setDownloading((prev) => ({ ...prev, [template.id]: true }));

    try {
      // Track for quota
      fetch("/api/render/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id, template_id: template.id }),
      }).catch(() => {});

      // Load Google Fonts used in the template
      const templateFonts = extractFontsFromCanvasJson(template.canvas_json);
      if (templateFonts.length > 0) loadMultipleFonts(templateFonts);

      // Client-side render
      const { StaticCanvas, FabricImage, Pattern } = await import("fabric");
      const canvas = new StaticCanvas(undefined, {
        width: template.width,
        height: template.height,
      });
      await canvas.loadFromJSON(template.canvas_json);

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
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${event.slug}-${template.format}.png`;
      a.click();
      canvas.dispose();
    } catch (e) {
      console.warn("Download failed:", e);
    } finally {
      setDownloading((prev) => ({ ...prev, [template.id]: false }));
    }
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
              {logoUrl ? (
                <img src={logoUrl} alt="" className="mx-auto mb-5 h-14 object-contain" />
              ) : (
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: primaryColor ?? "#6366f1" }}>
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold tracking-tight">{event.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Entrez le mot de passe pour accéder au media kit</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                  className="h-11 rounded-xl pl-10"
                />
              </div>
              {passwordError && <p className="text-sm font-medium text-destructive">Mot de passe incorrect</p>}
              <Button type="submit" className="h-11 w-full rounded-xl font-semibold" style={primaryColor ? { backgroundColor: primaryColor } : undefined}>
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
            ? { backgroundImage: `url(${headerImageUrl})`, backgroundSize: "cover", backgroundPosition: (b?.header_image_position as string) || "center" }
            : { backgroundColor: primaryColor ?? "#1e1b4b" }
        }
      >
        {headerImageUrl && showHeaderOverlay && <div className="absolute inset-0" style={{ backgroundColor: `${primaryColor ?? "#1e1b4b"}77` }} />}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {logoUrl && <img src={logoUrl} alt={org.name} className="h-16 rounded-xl object-contain shadow-lg" />}
              <div className="text-white">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{event.name}</h1>
                {showDates && event.start_date && (
                  <p className="mt-1.5 text-sm font-medium text-white/60">
                    {new Date(event.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {event.end_date && ` — ${new Date(event.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle className="text-white/70 hover:bg-white/10 hover:text-white" />
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm">
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
            <p className="text-center text-[15px] leading-relaxed text-muted-foreground">{event.description}</p>
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
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-[13px] font-semibold transition-all",
                  activeCategory === cat.id
                    ? "text-white shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
                style={activeCategory === cat.id ? { backgroundColor: primaryColor ?? "#6366f1" } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {visibleTemplates.length > 0 ? (
          <>
            {/* Format selector — top */}
            <div className="mb-8">
              <h2 className="mb-1 text-lg font-bold tracking-tight">Choisissez votre format</h2>
              <p className="mb-4 text-[13px] text-muted-foreground">Sélectionnez un format puis personnalisez votre visuel</p>

              <div className="flex flex-wrap gap-3">
                {visibleTemplates.map((template) => {
                  const preset = FORMAT_PRESETS[template.format as TemplateFormat];
                  const isActive = selectedTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={cn(
                        "flex flex-col items-center rounded-xl border-2 p-3 transition-all",
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/40 bg-white hover:border-border"
                      )}
                    >
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt=""
                          className="mb-2 h-16 w-auto rounded object-contain"
                        />
                      ) : (
                        <div
                          className="mb-2 rounded bg-muted/50"
                          style={{
                            width: 56,
                            height: Math.min(56 * (template.height / template.width), 72),
                          }}
                        />
                      )}
                      <span className="text-[12px] font-semibold">{preset?.label.split(" (")[0] ?? template.name}</span>
                      <span className="text-[10px] text-muted-foreground">{template.width}x{template.height}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split layout: form left + preview right */}
            {selectedTemplate && (
              <div className="flex flex-col gap-8 md:flex-row">
                {/* Left: variable fields */}
                <div className="flex-1 space-y-5 md:max-w-md">
                  <div>
                    <h3 className="mb-1 text-base font-bold tracking-tight">Personnalisez votre visuel</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Remplissez les champs, l&apos;aperçu se met à jour en temps réel
                    </p>
                  </div>

                  {usedFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <Label className="text-[13px] font-semibold">
                        {field.label}
                        {field.required && <span className="text-destructive"> *</span>}
                      </Label>

                      {field.field_type === "textarea" ? (
                        <Textarea
                          value={fieldValues[field.name] ?? ""}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          placeholder={`Saisissez votre ${field.label.toLowerCase()}`}
                          className="min-h-[80px] rounded-xl bg-white shadow-sm resize-none"
                        />
                      ) : field.field_type === "image" ? (
                        <div>
                          {fieldValues[field.name] && editingImage !== field.name ? (
                            <div className="flex flex-col items-center rounded-xl border bg-white p-3">
                              <img src={fieldValues[field.name]} alt="" className="mb-2 h-24 rounded-lg object-contain" />
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingImage(field.name)}>Recadrer</Button>
                                <Button variant="ghost" size="sm" onClick={() => { updateField(field.name, ""); setEditingImage(null); }}>Retirer</Button>
                              </div>
                            </div>
                          ) : fieldValues[field.name] && editingImage === field.name ? (
                            <div className="rounded-xl border bg-white p-3">
                              <ImageCropEditor
                                imageUrl={fieldValues[field.name]}
                                onConfirm={(url) => { updateField(field.name, url); setEditingImage(null); }}
                                onRemove={() => { updateField(field.name, ""); setEditingImage(null); }}
                              />
                            </div>
                          ) : (
                            <label className="group flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed bg-white p-5 transition-all hover:border-primary/40">
                              <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                              <span className="text-[12px] font-medium text-muted-foreground">Cliquez ou déposez une image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    updateField(field.name, url);
                                    setEditingImage(field.name);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      ) : (
                        <Input
                          value={fieldValues[field.name] ?? ""}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          placeholder={`Saisissez votre ${field.label.toLowerCase()}`}
                          className="h-11 rounded-xl bg-white shadow-sm"
                        />
                      )}
                    </div>
                  ))}

                  {/* Download button */}
                  <Button
                    size="lg"
                    className="w-full rounded-xl text-[14px] font-semibold shadow-md"
                    style={primaryColor ? { backgroundColor: primaryColor } : undefined}
                    onClick={() => handleDownload(selectedTemplate)}
                    disabled={downloading[selectedTemplate.id]}
                  >
                    {downloading[selectedTemplate.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger le visuel
                      </>
                    )}
                  </Button>
                </div>

                {/* Right: preview sticky */}
                <div className="w-full flex-1 md:sticky md:top-8 md:self-start">
                  <div className="mb-2 flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Aperçu en direct</span>
                    <span className="font-medium">
                      {FORMAT_PRESETS[selectedTemplate.format as TemplateFormat]?.label ?? selectedTemplate.format}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border shadow-sm">
                    <TemplatePreview
                      key={selectedTemplate.id}
                      canvasJson={selectedTemplate.canvas_json}
                      width={selectedTemplate.width}
                      height={selectedTemplate.height}
                      fieldValues={fieldValues}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed">
            <p className="text-muted-foreground">Aucun template publié pour cet événement</p>
          </div>
        )}
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
