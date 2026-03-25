"use client";

import { useCallback, useRef, useState } from "react";
import type { Canvas } from "fabric";
import { CanvasWrapper } from "./canvas-wrapper";
import { Toolbar } from "./toolbar";
import { PropertiesPanel } from "./properties-panel";
import { FormatSelector } from "./format-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/store/editor-store";
import { CUSTOM_PROPERTIES } from "@/lib/fabric/variable-fields";
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
  const { isDirty, setIsDirty, format, canvasWidth, canvasHeight } =
    useEditorStore();

  const handleCanvasReady = useCallback((canvas: Canvas) => {
    canvasRef.current = canvas;
  }, []);

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
      // Enter preview: fill variable zones with sample data
      canvas.getObjects().forEach((obj) => {
        const typed = obj as unknown as Record<string, unknown>;
        if (typed.variableField && typed.text !== undefined) {
          typed._originalText = typed.text;
          const field = variableFields.find(
            (f) => f.name === typed.variableField
          );
          typed.text = field?.label ?? String(typed.variableField);
        }
      });
      canvas.discardActiveObject();
      canvas.selection = false;
    } else {
      // Exit preview: restore placeholder text
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
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Nom du template"
            className="h-8 w-64"
          />
          <FormatSelector />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={togglePreview}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Quitter aperçu" : "Aperçu"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
            {isDirty && !saving && " *"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {!previewMode && <Toolbar canvas={canvasRef.current} />}

      {/* Canvas + Properties */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <CanvasWrapper
            initialJson={initialJson}
            onCanvasReady={handleCanvasReady}
          />
        </div>
        {!previewMode && (
          <PropertiesPanel
            canvas={canvasRef.current}
            variableFields={variableFields}
          />
        )}
      </div>
    </div>
  );
}
