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
import { Save, Eye } from "lucide-react";
import type { VariableFieldDefinition } from "@/types";

interface TemplateEditorProps {
  templateId?: string;
  eventId: string;
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

export function TemplateEditor({
  initialName = "",
  initialJson,
  variableFields,
  onSave,
}: TemplateEditorProps) {
  const canvasRef = useRef<Canvas | null>(null);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [layersKey, setLayersKey] = useState(0);
  const { isDirty, setIsDirty, format, canvasWidth, canvasHeight } =
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
    <div className="flex h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
            placeholder="Nom du template"
            className="h-8 w-56 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={togglePreview}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {previewMode ? "Quitter aperçu" : "Aperçu"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? "..." : "Enregistrer"}
            {isDirty && !saving && " *"}
          </Button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Elements + Canvas settings */}
        {!previewMode && (
          <ElementsPanel canvas={canvasRef.current} onAdd={refreshLayers} />
        )}

        {/* Center: Canvas workspace */}
        <div className="flex-1 overflow-auto bg-neutral-100">
          <CanvasWrapper
            initialJson={initialJson}
            onCanvasReady={handleCanvasReady}
          />
        </div>

        {/* Right: Properties + Layers */}
        {!previewMode && (
          <div className="flex w-72 flex-col border-l bg-white">
            <PropertiesPanel
              canvas={canvasRef.current}
              variableFields={variableFields}
            />
            <LayersPanel key={layersKey} canvas={canvasRef.current} />
          </div>
        )}
      </div>
    </div>
  );
}
