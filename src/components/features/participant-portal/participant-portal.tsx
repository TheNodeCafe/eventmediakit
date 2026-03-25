"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { TemplatePreview } from "./template-preview";

interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  field_type: "text" | "image" | "textarea";
  required: boolean;
}

interface TemplateData {
  id: string;
  name: string;
  width: number;
  height: number;
  canvas_json: Record<string, unknown>;
}

interface ParticipantPortalProps {
  participant: Record<string, unknown>;
  event: Record<string, unknown>;
  fieldDefinitions: FieldDefinition[];
  templates: TemplateData[];
  token: string;
}

export function ParticipantPortal({
  participant,
  event,
  fieldDefinitions,
  templates,
  token,
}: ParticipantPortalProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    (participant.field_values as Record<string, string>) ?? {}
  );
  const [consented, setConsented] = useState(!!participant.gdpr_consent_at);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<Record<string, string>>({});

  const org = event.organization as {
    name: string;
    logo_url: string | null;
    primary_color: string | null;
  } | null;

  async function handleConsent() {
    const res = await fetch(`/api/participant/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gdpr_consent_at: new Date().toISOString() }),
    });
    if (res.ok) setConsented(true);
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/participant/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_values: fieldValues }),
    });
    setSaving(false);
  }

  function updateField(name: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleDownload(templateId: string) {
    setDownloading((prev) => ({ ...prev, [templateId]: "pending" }));

    try {
      // Request render
      const res = await fetch(`/api/participant/${token}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });

      const result = await res.json();
      if (!result.success) {
        setDownloading((prev) => ({ ...prev, [templateId]: "error" }));
        return;
      }

      const generationId = result.data.generation_id;
      setDownloading((prev) => ({ ...prev, [templateId]: "processing" }));

      // Poll for completion
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 2000));

        const statusRes = await fetch(`/api/generations/${generationId}`);
        const statusData = await statusRes.json();

        if (statusData.data?.status === "completed" && statusData.data?.file_url) {
          setDownloading((prev) => ({ ...prev, [templateId]: "done" }));
          // Trigger download
          const a = document.createElement("a");
          a.href = statusData.data.file_url;
          a.download = `visual-${templateId}.png`;
          a.click();
          return;
        }

        if (statusData.data?.status === "failed") {
          setDownloading((prev) => ({ ...prev, [templateId]: "error" }));
          return;
        }
      }

      // Timeout
      setDownloading((prev) => ({ ...prev, [templateId]: "error" }));
    } catch {
      setDownloading((prev) => ({ ...prev, [templateId]: "error" }));
    }
  }

  // GDPR consent screen
  if (!consented) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{event.name as string}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              En continuant, vous acceptez que vos données (nom, photo, email)
              soient utilisées pour générer des visuels dans le cadre de cet
              événement. Vous pouvez demander la suppression de vos données à
              tout moment.
            </p>
            <Button onClick={handleConsent} className="w-full">
              J&apos;accepte et je continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header with event branding */}
      <header
        className="border-b bg-white px-6 py-4"
        style={
          org?.primary_color
            ? { borderBottomColor: org.primary_color }
            : undefined
        }
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          {org?.logo_url && (
            <img
              src={org.logo_url}
              alt=""
              className="h-8 w-8 rounded object-contain"
            />
          )}
          <h1 className="text-lg font-semibold">{event.name as string}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {/* Field form */}
        <Card>
          <CardHeader>
            <CardTitle>Vos informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldDefinitions.map((field) => (
              <div key={field.id} className="space-y-1">
                <Label>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                {field.field_type === "textarea" ? (
                  <Textarea
                    value={fieldValues[field.name] ?? ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    placeholder={field.label}
                  />
                ) : field.field_type === "image" ? (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: upload to Supabase Storage and use real URL
                        updateField(field.name, URL.createObjectURL(file));
                      }
                    }}
                  />
                ) : (
                  <Input
                    value={fieldValues[field.name] ?? ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer mes informations"}
            </Button>
          </CardContent>
        </Card>

        {/* Template previews with live data */}
        {templates.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Vos visuels</h2>
            <p className="text-sm text-muted-foreground">
              Aperçu en temps réel — remplissez vos informations ci-dessus pour
              voir les visuels se mettre à jour
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
              {templates.map((template) => {
                const dlStatus = downloading[template.id];
                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Live Fabric.js preview */}
                      <TemplatePreview
                        canvasJson={template.canvas_json}
                        width={template.width}
                        height={template.height}
                        fieldValues={fieldValues}
                      />

                      {/* Download button */}
                      <Button
                        className="w-full"
                        onClick={() => handleDownload(template.id)}
                        disabled={
                          dlStatus === "pending" || dlStatus === "processing"
                        }
                      >
                        {dlStatus === "pending" || dlStatus === "processing" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Génération en cours...
                          </>
                        ) : dlStatus === "done" ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Téléchargé — Retélécharger
                          </>
                        ) : dlStatus === "error" ? (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Erreur — Réessayer
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger en HD
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
