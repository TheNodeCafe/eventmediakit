"use client";

import { useEffect, useRef, useCallback } from "react";

interface TemplatePreviewProps {
  canvasJson: Record<string, unknown>;
  width: number;
  height: number;
  fieldValues: Record<string, string>;
}

export function TemplatePreview({
  canvasJson,
  width,
  height,
  fieldValues,
}: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null);
  const initDone = useRef(false);
  const maxPreviewWidth = 560;
  const scale = Math.min(maxPreviewWidth / width, 1);

  // Store field values in ref so we can access latest in init
  const fieldValuesRef = useRef(fieldValues);
  fieldValuesRef.current = fieldValues;

  const injectValues = useCallback((canvas: { getObjects: () => unknown[]; renderAll: () => void }, values: Record<string, string>) => {
    canvas.getObjects().forEach((obj) => {
      const typed = obj as Record<string, unknown>;
      const variableField = typed.variableField as string | undefined;
      if (variableField && typed.text !== undefined) {
        const newText = values[variableField] || `{{${variableField}}}`;
        // Use set method if available for proper Fabric.js reactivity
        const fabricObj = obj as { set?: (key: string, value: string) => void };
        if (typeof fabricObj.set === "function") {
          fabricObj.set("text", newText);
        } else {
          typed.text = newText;
        }
      }
    });
    canvas.renderAll();
  }, []);

  // Initialize canvas once
  useEffect(() => {
    let disposed = false;

    async function init() {
      if (!canvasRef.current || initDone.current) return;

      const { StaticCanvas } = await import("fabric");
      if (disposed) return;

      const canvas = new StaticCanvas(canvasRef.current, {
        width: width * scale,
        height: height * scale,
        backgroundColor: "#ffffff",
      });

      canvas.setZoom(scale);

      if (canvasJson && Object.keys(canvasJson).length > 0) {
        await canvas.loadFromJSON(canvasJson);
        canvas.setZoom(scale);
      }

      // Inject initial values
      injectValues(canvas, fieldValuesRef.current);

      fabricRef.current = canvas;
      initDone.current = true;
    }

    init();

    return () => {
      disposed = true;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        initDone.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasJson, width, height, scale]);

  // Re-inject values on every fieldValues change
  useEffect(() => {
    if (!fabricRef.current) return;
    injectValues(fabricRef.current, fieldValues);
  }, [fieldValues, injectValues]);

  return (
    <div className="flex justify-center overflow-hidden rounded-lg border bg-white">
      <canvas ref={canvasRef} />
    </div>
  );
}
