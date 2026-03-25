"use client";

import { useEffect, useState, useCallback } from "react";
import type { Canvas, FabricObject, Textbox } from "fabric";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store/editor-store";
import { VARIABLE_FIELD_PROPERTY } from "@/lib/fabric/variable-fields";
import type { VariableFieldDefinition } from "@/types";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag,
} from "lucide-react";

interface PropertiesPanelProps {
  canvas: Canvas | null;
  variableFields: VariableFieldDefinition[];
}

interface ObjectProps {
  type: string;
  fill: string;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: string;
  text?: string;
  variableField: string;
}

export function PropertiesPanel({
  canvas,
  variableFields,
}: PropertiesPanelProps) {
  const { selectedObjectId } = useEditorStore();
  const [props, setProps] = useState<ObjectProps | null>(null);

  const syncProps = useCallback(() => {
    if (!canvas || !selectedObjectId) {
      setProps(null);
      return;
    }
    const obj = canvas
      .getObjects()
      .find(
        (o) => (o as FabricObject & { id?: string }).id === selectedObjectId
      );
    if (!obj) {
      setProps(null);
      return;
    }

    const typed = obj as FabricObject & {
      id?: string;
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string;
      fontStyle?: string;
      underline?: boolean;
      textAlign?: string;
      text?: string;
      [VARIABLE_FIELD_PROPERTY]?: string;
    };

    setProps({
      type: (obj.type ?? "object") as string,
      fill: (typed.fill as string) ?? "#000000",
      opacity: typed.opacity ?? 1,
      fontSize: typed.fontSize,
      fontFamily: typed.fontFamily,
      fontWeight: typed.fontWeight,
      fontStyle: typed.fontStyle,
      underline: typed.underline,
      textAlign: typed.textAlign,
      text: typed.text,
      variableField: typed[VARIABLE_FIELD_PROPERTY] ?? "",
    });
  }, [canvas, selectedObjectId]);

  useEffect(() => {
    syncProps();
  }, [syncProps]);

  useEffect(() => {
    if (!canvas) return;
    const handler = () => syncProps();
    canvas.on("selection:created", handler);
    canvas.on("selection:updated", handler);
    canvas.on("selection:cleared", handler);
    canvas.on("object:modified", handler);
    return () => {
      canvas.off("selection:created", handler);
      canvas.off("selection:updated", handler);
      canvas.off("selection:cleared", handler);
      canvas.off("object:modified", handler);
    };
  }, [canvas, syncProps]);

  function getActiveObject() {
    if (!canvas) return null;
    return canvas.getActiveObject() as
      | (FabricObject & Record<string, unknown>)
      | null;
  }

  function updateProp(key: string, value: unknown) {
    const obj = getActiveObject();
    if (!obj) return;
    obj.set(key as keyof typeof obj, value as never);
    canvas?.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  function handleVariableFieldChange(value: string | null) {
    if (!value) return;
    const obj = getActiveObject();
    if (!obj) return;
    const fieldValue = value === "__none__" ? "" : value;
    (obj as unknown as Record<string, unknown>)[VARIABLE_FIELD_PROPERTY] =
      fieldValue;

    // Update text placeholder
    if (obj.text !== undefined && fieldValue) {
      const fieldDef = variableFields.find((f) => f.name === fieldValue);
      if (fieldDef) {
        (obj as unknown as Textbox).set("text", `{{${fieldDef.label}}}`);
      }
    }

    canvas?.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  const isText =
    props?.type === "textbox" ||
    props?.type === "i-text" ||
    props?.type === "text";

  if (!props) {
    return (
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Propriétés
        </h3>
        <p className="py-8 text-center text-xs text-muted-foreground">
          Sélectionnez un élément
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Propriétés
      </h3>

      <div className="space-y-4">
        {/* ===== VARIABLE ZONE (top priority) ===== */}
        {variableFields.length > 0 && (
          <div
            className={`rounded-lg border p-2.5 ${
              props.variableField
                ? "border-orange-300 bg-orange-50"
                : "border-dashed border-muted-foreground/30"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-[11px] font-semibold text-orange-600">
                Zone variable
              </span>
            </div>
            <Select
              value={props.variableField || "__none__"}
              onValueChange={handleVariableFieldChange}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Aucune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  Élément fixe (non modifiable)
                </SelectItem>
                {variableFields.map((field) => (
                  <SelectItem key={field.id} value={field.name}>
                    {field.label} — {field.field_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {props.variableField && (
              <p className="mt-1 text-[10px] text-orange-500">
                Les visiteurs rempliront ce champ
              </p>
            )}
            {variableFields.length === 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Ajoutez des champs variables dans les paramètres de
                l&apos;événement
              </p>
            )}
          </div>
        )}

        {/* ===== TEXT CONTROLS ===== */}
        {isText && (
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground">
              Texte
            </label>

            {/* Font family + size */}
            <div className="flex gap-1.5">
              <Select
                value={props.fontFamily ?? "Arial"}
                onValueChange={(v) => v && updateProp("fontFamily", v)}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Arial",
                    "Helvetica",
                    "Inter",
                    "Georgia",
                    "Times New Roman",
                    "Courier New",
                    "Verdana",
                    "Impact",
                    "Trebuchet MS",
                  ].map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={props.fontSize ?? 16}
                onChange={(e) =>
                  updateProp("fontSize", parseInt(e.target.value) || 16)
                }
                className="h-7 w-16 text-center text-xs"
              />
            </div>

            {/* Bold / Italic / Underline / Alignment */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() =>
                  updateProp(
                    "fontWeight",
                    props.fontWeight === "bold" ? "normal" : "bold"
                  )
                }
                className={`rounded p-1.5 transition-colors ${
                  props.fontWeight === "bold"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  updateProp(
                    "fontStyle",
                    props.fontStyle === "italic" ? "normal" : "italic"
                  )
                }
                className={`rounded p-1.5 transition-colors ${
                  props.fontStyle === "italic"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => updateProp("underline", !props.underline)}
                className={`rounded p-1.5 transition-colors ${
                  props.underline
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>

              <div className="mx-1 h-4 w-px bg-border" />

              {(["left", "center", "right"] as const).map((align) => {
                const Icon =
                  align === "left"
                    ? AlignLeft
                    : align === "center"
                      ? AlignCenter
                      : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() => updateProp("textAlign", align)}
                    className={`rounded p-1.5 transition-colors ${
                      props.textAlign === align
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== FILL COLOR ===== */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Couleur
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={props.fill}
              onChange={(e) => updateProp("fill", e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border"
            />
            <Input
              value={props.fill}
              onChange={(e) => updateProp("fill", e.target.value)}
              className="h-7 font-mono text-xs"
            />
          </div>
        </div>

        {/* ===== OPACITY ===== */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-muted-foreground">
              Opacité
            </label>
            <span className="text-[11px] text-muted-foreground">
              {Math.round(props.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={props.opacity}
            onChange={(e) => updateProp("opacity", parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
