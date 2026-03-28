"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Canvas } from "fabric";
import { CanvasWrapper } from "./canvas-wrapper";
import { ElementsPanel } from "./elements-panel";
import { LayersPanel } from "./layers-panel";
import { PropertiesPanel } from "./properties-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import { CUSTOM_PROPERTIES } from "@/lib/fabric/variable-fields";
import type { TemplateFormat, VariableFieldDefinition, ParticipantCategory } from "@/types";
import { Save, Eye, ArrowLeft, Tag, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface TemplateEditorProps {
  templateId?: string;
  eventId: string;
  backUrl?: string;
  initialName?: string;
  initialJson?: Record<string, unknown>;
  variableFields: VariableFieldDefinition[];
  categories?: ParticipantCategory[];
  initialCategoryIds?: string[];
  onSave: (data: {
    name: string;
    canvas_json: Record<string, unknown>;
    format: string;
    width: number;
    height: number;
    category_ids?: string[];
  }) => Promise<void>;
}

const formats: { key: TemplateFormat; label: string }[] = [
  { key: "square_1x1", label: "Carré" },
  { key: "story_9x16", label: "Story" },
  { key: "landscape_16x9", label: "Paysage" },
  { key: "post_4x5", label: "Post 4:5" },
];

export function TemplateEditor({
  eventId,
  initialName = "",
  initialJson,
  variableFields,
  categories = [],
  initialCategoryIds = [],
  onSave,
  backUrl,
}: TemplateEditorProps) {
  const canvasRef = useRef<Canvas | null>(null);
  const [name, setName] = useState(initialName);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [layersKey, setLayersKey] = useState(0);
  const { isDirty, setIsDirty, format, canvasWidth, canvasHeight, setFormat } =
    useEditorStore();

  // Unsaved changes warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleCanvasReady = useCallback((canvas: Canvas) => {
    canvasRef.current = canvas;
  }, []);

  function refreshLayers() {
    setLayersKey((k) => k + 1);
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas || !name.trim()) return;
    setSaving(true);
    setSaveStatus("idle");
    setSaveError("");

    try {
      // Serialize with custom properties (variableField, id)
      // Fabric.js v7 types don't expose the parameter but it works at runtime
      const json = (canvas as unknown as { toJSON: (props: string[]) => Record<string, unknown> }).toJSON(CUSTOM_PROPERTIES);

      // Verify the JSON has objects
      const objects = (json as { objects?: unknown[] }).objects;
      console.log(`[editor] Saving template: ${objects?.length ?? 0} objects, format: ${format}`);

      await onSave({
        name: name.trim(),
        canvas_json: json,
        format,
        width: canvasWidth,
        height: canvasHeight,
        category_ids: selectedCategoryIds,
      });
      setIsDirty(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("[editor] Save failed:", err);
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function togglePreview() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!previewMode) {
      canvas.getObjects().forEach((obj) => {
        const typed = obj as unknown as Record<string, unknown>;
        if (typed.variableField && typed.text !== undefined) {
          typed._originalText = typed.text;
          const field = variableFields.find((f) => f.name === typed.variableField);
          typed.text = field?.label ?? String(typed.variableField);
        }
      });
      canvas.discardActiveObject();
      canvas.selection = false;
    } else {
      canvas.getObjects().forEach((obj) => {
        const typed = obj as unknown as Record<string, unknown>;
        if (typed._originalText !== undefined) {
          typed.text = typed._originalText as string;
          delete typed._originalText;
        }
      });
      canvas.selection = true;
    }
    canvas.renderAll();
    setPreviewMode(!previewMode);
  }

  return (
    <div className="-m-8 flex h-[calc(100vh-3.5rem)] flex-col bg-[#f0f1f3]">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-3">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl ?? `/events/${eventId}/templates`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-black/[0.04] hover:text-foreground"
            title="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="h-5 w-px bg-black/[0.08]" />

          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
            placeholder="Nom du template"
            className="h-7 w-44 border-transparent bg-transparent text-[13px] font-medium shadow-none placeholder:text-muted-foreground/40 hover:bg-black/[0.03] focus:border-primary/30 focus:bg-white focus:shadow-none"
          />

          <div className="h-5 w-px bg-black/[0.08]" />

          {/* Format selector pills */}
          <div className="flex items-center gap-1 rounded-full bg-black/[0.04] p-0.5">
            {formats.map((f) => {
              const preset = FORMAT_PRESETS[f.key];
              const isActive = format === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key, preset.width, preset.height)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                    isActive
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category badges */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              <Tag className="h-3 w-3 text-muted-foreground/50" />
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryIds((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== cat.id)
                          : [...prev, cat.id]
                      );
                      setIsDirty(true);
                    }}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                      isSelected
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-black/[0.04] text-muted-foreground/60 hover:bg-black/[0.06]"
                    }`}
                    title={isSelected ? `Retirer ${cat.name}` : `Ajouter ${cat.name}`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="h-5 w-px bg-black/[0.08]" />

          <Button
            variant={previewMode ? "default" : "ghost"}
            size="sm"
            onClick={togglePreview}
            className={`h-7 rounded-lg text-[12px] font-medium ${
              previewMode ? "" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {previewMode ? "Quitter" : "Aperçu"}
          </Button>

          {/* Save button with status */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={`h-7 rounded-lg text-[12px] font-medium shadow-none ${
              saveStatus === "success" ? "bg-emerald-500 hover:bg-emerald-500" :
              saveStatus === "error" ? "bg-destructive hover:bg-destructive" : ""
            }`}
          >
            {saving ? (
              <>
                <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Sauvegarde...
              </>
            ) : saveStatus === "success" ? (
              <>
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Sauvegardé
              </>
            ) : saveStatus === "error" ? (
              <>
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Erreur
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Sauver{isDirty && " *"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {saveStatus === "error" && saveError && (
        <div className="shrink-0 bg-destructive/10 px-4 py-2 text-center text-[12px] font-medium text-destructive">
          {saveError}
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex min-h-0 flex-1">
        {!previewMode && (
          <ElementsPanel canvas={canvasRef.current} onAdd={refreshLayers} />
        )}

        <div className="min-h-0 flex-1 overflow-auto bg-[#e8eaed]">
          <CanvasWrapper
            initialJson={initialJson}
            onCanvasReady={handleCanvasReady}
          />
        </div>

        {!previewMode && (
          <div className="flex w-64 min-h-0 flex-col border-l border-black/[0.06] bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PropertiesPanel
                canvas={canvasRef.current}
                variableFields={variableFields}
              />
            </div>
            <div className="h-48 shrink-0 overflow-y-auto border-t border-black/[0.06]">
              <LayersPanel key={layersKey} canvas={canvasRef.current} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
