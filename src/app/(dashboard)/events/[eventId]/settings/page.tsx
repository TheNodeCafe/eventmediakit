"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useEvent } from "@/hooks/use-events";
import { useQueryClient } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  ImageIcon,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface Branding {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  cover_url?: string;
  header_image_url?: string;
  show_dates?: boolean;
  show_description?: boolean;
  show_org_name?: boolean;
  show_header_overlay?: boolean;
  header_image_position?: string; // "center", "top", "bottom", or "Xpx Ypx"
}

export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event, isLoading } = useEvent(eventId);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [password, setPassword] = useState("");
  const [branding, setBranding] = useState<Branding>({
    primary_color: "#6366f1",
    show_dates: true,
    show_description: true,
    show_org_name: true,
  });

  // Populate from event data
  useEffect(() => {
    if (!event) return;
    setName(event.name);
    setDescription(event.description ?? "");
    setStartDate(event.start_date ?? "");
    setEndDate(event.end_date ?? "");
    setPassword(event.access_password ?? "");
    setBranding({
      primary_color: "#6366f1",
      show_dates: true,
      show_description: true,
      show_org_name: true,
      ...((event.branding ?? {}) as Branding),
    });
  }, [event]);

  function updateBranding(key: string, value: unknown) {
    setBranding((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/events/${eventId}/branding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        access_password: password,
        branding,
      }),
    });
    queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleImageUpload(key: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          updateBranding(key, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  const primaryColor = branding.primary_color ?? "#6366f1";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${eventId}`}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Personnalisation</h1>
            <p className="text-muted-foreground">
              Personnalisez l&apos;apparence de votre page publique
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* General info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom de l&apos;événement</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[70px] resize-none"
                  placeholder="Décrivez votre événement..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Date début</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date fin</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Mot de passe (optionnel)</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9"
                  placeholder="Laisser vide pour accès public"
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Couleurs</CardTitle>
              <CardDescription>Couleur principale du header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => updateBranding("primary_color", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => updateBranding("primary_color", e.target.value)}
                  className="h-9 w-28 font-mono text-sm"
                />
                <div className="flex gap-1">
                  {["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#1e1b4b"].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateBranding("primary_color", c)}
                      className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: primaryColor === c ? "white" : "transparent",
                        boxShadow: primaryColor === c ? `0 0 0 2px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Images</CardTitle>
              <CardDescription>Logo et image de fond du header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-1.5">
                <Label className="text-xs">Logo</Label>
                <div className="flex items-center gap-3">
                  {branding.logo_url ? (
                    <img
                      src={branding.logo_url}
                      alt="Logo"
                      className="h-12 w-12 rounded-lg border object-contain"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUpload("logo_url")}
                    >
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                      {branding.logo_url ? "Changer" : "Ajouter"}
                    </Button>
                    {branding.logo_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateBranding("logo_url", undefined)}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Header image */}
              <div className="space-y-1.5">
                <Label className="text-xs">Image de fond du header</Label>
                <p className="text-[11px] text-muted-foreground">
                  Remplace la couleur unie. Glissez pour repositionner.
                </p>
                {branding.header_image_url ? (
                  <div className="space-y-2">
                    <HeaderImagePositioner
                      imageUrl={branding.header_image_url}
                      position={branding.header_image_position as string | undefined}
                      onPositionChange={(pos) => updateBranding("header_image_position", pos)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleImageUpload("header_image_url")}
                      >
                        Changer
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          updateBranding("header_image_url", undefined);
                          updateBranding("header_image_position", undefined);
                        }}
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleImageUpload("header_image_url")}
                    className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-1 h-5 w-5" />
                      <span className="text-xs">Ajouter une image de fond</span>
                    </div>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Display options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Affichage</CardTitle>
              <CardDescription>Choisissez ce qui apparaît sur la page publique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ToggleOption
                label="Dates de l'événement"
                enabled={branding.show_dates !== false}
                onChange={(v) => updateBranding("show_dates", v)}
              />
              <ToggleOption
                label="Description"
                enabled={branding.show_description !== false}
                onChange={(v) => updateBranding("show_description", v)}
              />
              <ToggleOption
                label="Nom de l'organisation"
                enabled={branding.show_org_name !== false}
                onChange={(v) => updateBranding("show_org_name", v)}
              />
              <ToggleOption
                label="Overlay couleur sur l'image de fond"
                enabled={branding.show_header_overlay !== false}
                onChange={(v) => updateBranding("show_header_overlay", v)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aperçu de la page publique</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-b-xl">
                {/* Mini preview of the public page */}
                <div className="scale-[1] origin-top">
                  {/* Header preview */}
                  <div
                    className="relative overflow-hidden px-5 py-6 text-white"
                    style={
                      branding.header_image_url
                        ? {
                            backgroundImage: `url(${branding.header_image_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: branding.header_image_position || "center",
                          }
                        : { backgroundColor: primaryColor }
                    }
                  >
                    {branding.header_image_url && branding.show_header_overlay !== false && (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: `${primaryColor}88` }}
                      />
                    )}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                    </div>

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {branding.logo_url ? (
                          <img
                            src={branding.logo_url}
                            alt=""
                            className="h-10 rounded-lg object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                            <Sparkles className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold">{name || "Nom de l'événement"}</p>
                          {branding.show_dates !== false && (startDate || endDate) && (
                            <p className="text-[10px] text-white/60">
                              {startDate && new Date(startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              {endDate && ` — ${new Date(endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold tracking-wide backdrop-blur-sm">
                        MEDIAKIT
                      </div>
                    </div>
                  </div>

                  {/* Description preview */}
                  {branding.show_description !== false && description && (
                    <div className="border-b bg-white px-5 py-3">
                      <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  )}

                  {/* Content preview placeholder */}
                  <div className="bg-[#fafafa] px-5 py-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="h-2 w-20 rounded bg-muted" />
                        <div className="h-7 rounded-lg bg-white border" />
                        <div className="h-2 w-16 rounded bg-muted" />
                        <div className="h-7 rounded-lg bg-white border" />
                        <div className="mt-3 h-8 rounded-lg" style={{ backgroundColor: primaryColor, opacity: 0.8 }} />
                      </div>
                      <div className="flex items-center justify-center rounded-xl border bg-white p-4">
                        <div className="text-center">
                          <div className="mx-auto mb-1 h-16 w-16 rounded-lg bg-muted" />
                          <div className="mx-auto h-1.5 w-12 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer preview */}
                  {branding.show_org_name !== false && (
                    <div className="border-t bg-white px-5 py-2">
                      <p className="text-[9px] text-muted-foreground/40">
                        Propulsé par EventMediaKit
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HeaderImagePositioner({
  imageUrl,
  position,
  onPositionChange,
}: {
  imageUrl: string;
  position?: string;
  onPositionChange: (pos: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [yPercent, setYPercent] = useState(() => {
    if (!position || position === "center") return 50;
    const match = position.match(/center (\d+)%/);
    return match ? parseInt(match[1]) : 50;
  });
  const dragStartY = useRef(0);
  const startPercent = useRef(0);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setDragging(true);
    dragStartY.current = e.clientY;
    startPercent.current = yPercent;
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || !containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;
    const delta = e.clientY - dragStartY.current;
    const percentDelta = (delta / containerHeight) * 100;
    const newPercent = Math.max(0, Math.min(100, startPercent.current + percentDelta));
    setYPercent(newPercent);
  }

  function handleMouseUp() {
    if (dragging) {
      setDragging(false);
      onPositionChange(`center ${Math.round(yPercent)}%`);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative h-28 cursor-grab overflow-hidden rounded-lg border active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={imageUrl}
        alt="Header"
        className="h-full w-full object-cover pointer-events-none"
        style={{ objectPosition: `center ${yPercent}%` }}
        draggable={false}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
        <p className="text-[10px] text-white/80">
          {dragging ? "Relâchez pour appliquer" : "Glissez verticalement pour repositionner"}
        </p>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50"
    >
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {enabled ? (
          <Eye className="h-4 w-4 text-primary" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
        <div
          className={`h-5 w-9 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <div
            className={`h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </div>
    </button>
  );
}
