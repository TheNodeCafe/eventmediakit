"use client";

import { useCallback, useRef, useState } from "react";
import type { Canvas } from "fabric";
import { CanvasWrapper } from "./canvas-wrapper";
import { ElementsPanel } from "./elements-panel";
import { LayersPanel } from "./layers-panel";
import { PropertiesPanel } from "./properties-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat, VariableFieldDefinition } from "@/types";
import { Save, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TemplateEditorProps {
  templateId?: string;
  eventId: string;
  backUrl?: string;
  initialName?: string;
  initialJson?: Record<string, unknown>;
  variableFields: VariableFieldDefinition[];
  onSave: (data: {
    name: string;
    canvas_json: Record<string, unknown>;
    format: string;
    width: number;
    height: number;
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
  onSave,
  backUrl,
}: TemplateEditorProps) {
  const canvasRef = useRef<Canvas | null>(null);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [layersKey, setLayersKey] = useState(0);
  const { isDirty, setIsDirty, format, canvasWidth, canvasHeight, setFormat } =
    useEditorStore();

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
    try {
      const json = canvas.toJSON() as Record<string, unknown>;
      await onSave({
        name: name.trim(),
        canvas_json: json,
        format,
        width: canvasWidth,
        height: canvasHeight,
      });
      setIsDirty(false);
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
    <div className="-m-8 flex h-[calc(100vh-3.5rem)] flex-col bg-white">
      {/* Top bar: name + formats + actions */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <Link
            href={backUrl ?? `/events/${eventId}/templates`}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
            placeholder="Nom du template"
            className="h-7 w-44 text-xs"
          />
          {/* Format selector inline */}
          <div className="flex items-center gap-1">
            {formats.map((f) => {
              const preset = FORMAT_PRESETS[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key, preset.width, preset.height)}
                  className={`rounded px-2 py-1 text-[10px] font-medium transition-colors ${
                    format === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={togglePreview}
            className="h-7 text-xs"
          >
            <Eye className="mr-1 h-3 w-3" />
            {previewMode ? "Quitter" : "Aperçu"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()} className="h-7 text-xs">
            <Save className="mr-1 h-3 w-3" />
            {saving ? "..." : "Sauver"}
            {isDirty && !saving && " *"}
          </Button>
        </div>
      </div>

      {/* 3-panel layout — takes remaining height */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Elements */}
        {!previewMode && (
          <ElementsPanel canvas={canvasRef.current} onAdd={refreshLayers} />
        )}

        {/* Center: Canvas workspace */}
        <div className="min-h-0 flex-1 overflow-auto bg-neutral-100">
          <CanvasWrapper
            initialJson={initialJson}
            onCanvasReady={handleCanvasReady}
          />
        </div>

        {/* Right: Properties + Layers */}
        {!previewMode && (
          <div className="flex w-64 min-h-0 flex-col border-l bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PropertiesPanel
                canvas={canvasRef.current}
                variableFields={variableFields}
              />
            </div>
            <div className="h-48 shrink-0 overflow-y-auto">
              <LayersPanel key={layersKey} canvas={canvasRef.current} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
