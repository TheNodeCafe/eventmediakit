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
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/editor-store";
import { VARIABLE_FIELD_PROPERTY } from "@/lib/fabric/variable-fields";
import type { VariableFieldDefinition } from "@/types";

interface PropertiesPanelProps {
  canvas: Canvas | null;
  variableFields: VariableFieldDefinition[];
}

interface ObjectProps {
  fill: string;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
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
      [VARIABLE_FIELD_PROPERTY]?: string;
    };

    setProps({
      fill: (typed.fill as string) ?? "#000000",
      opacity: typed.opacity ?? 1,
      fontSize: typed.fontSize,
      fontFamily: typed.fontFamily,
      variableField:
        typed[VARIABLE_FIELD_PROPERTY] ?? "",
    });
  }, [canvas, selectedObjectId]);

  useEffect(() => {
    syncProps();
  }, [syncProps]);

  // Listen for canvas selection changes
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
      | (FabricObject & {
          id?: string;
          fontSize?: number;
          fontFamily?: string;
          [VARIABLE_FIELD_PROPERTY]?: string;
        })
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
    (obj as unknown as Record<string, unknown>)[VARIABLE_FIELD_PROPERTY] = fieldValue;

    // If it's a text object, update placeholder text
    if ("text" in obj && fieldValue) {
      const fieldDef = variableFields.find((f) => f.name === fieldValue);
      if (fieldDef) {
        (obj as Textbox).set("text", `{{${fieldDef.label}}}`);
      }
    }

    canvas?.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  if (!props) {
    return (
      <div className="w-64 shrink-0 border-l bg-background p-4">
        <p className="text-sm text-muted-foreground">
          Sélectionnez un élément pour modifier ses propriétés
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 overflow-y-auto border-l bg-background p-4">
      <h3 className="mb-4 text-sm font-semibold">Propriétés</h3>

      <div className="space-y-4">
        {/* Fill color */}
        <div className="space-y-1">
          <Label className="text-xs">Couleur</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={props.fill}
              onChange={(e) => updateProp("fill", e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border"
            />
            <Input
              value={props.fill}
              onChange={(e) => updateProp("fill", e.target.value)}
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-1">
          <Label className="text-xs">Opacité</Label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={props.opacity}
            onChange={(e) => updateProp("opacity", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Text properties */}
        {props.fontSize !== undefined && (
          <>
            <Separator />
            <div className="space-y-1">
              <Label className="text-xs">Taille de police</Label>
              <Input
                type="number"
                value={props.fontSize}
                onChange={(e) =>
                  updateProp("fontSize", parseInt(e.target.value) || 16)
                }
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Police</Label>
              <Select
                value={props.fontFamily ?? "Arial"}
                onValueChange={(v) => updateProp("fontFamily", v)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Arial",
                    "Helvetica",
                    "Georgia",
                    "Times New Roman",
                    "Courier New",
                    "Verdana",
                    "Impact",
                  ].map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Variable zone assignment */}
        {variableFields.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-primary">
                Zone variable
              </Label>
              <Select
                value={props.variableField || "__none__"}
                onValueChange={handleVariableFieldChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune (fixe)</SelectItem>
                  {variableFields.map((field) => (
                    <SelectItem key={field.id} value={field.name}>
                      {field.label} ({field.field_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {props.variableField && (
                <p className="text-xs text-muted-foreground">
                  Ce champ sera rempli par le participant
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
