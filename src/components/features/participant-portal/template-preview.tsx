"use client";

import { useEffect, useRef } from "react";

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
  const fabricRef = useRef<unknown>(null);
  const maxPreviewWidth = 500;
  const scale = Math.min(maxPreviewWidth / width, 1);

  useEffect(() => {
    let disposed = false;

    async function init() {
      if (!canvasRef.current) return;

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
      }

      // Inject field values into variable zones
      canvas.getObjects().forEach((obj) => {
        const typed = obj as unknown as Record<string, unknown>;
        const variableField = typed.variableField as string | undefined;
        if (variableField && fieldValues[variableField] && typed.text !== undefined) {
          typed.text = fieldValues[variableField];
        }
      });

      canvas.renderAll();
      fabricRef.current = canvas;
    }

    init();

    return () => {
      disposed = true;
      if (fabricRef.current) {
        (fabricRef.current as { dispose: () => void }).dispose();
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update field values when they change
  useEffect(() => {
    const canvas = fabricRef.current as {
      getObjects: () => unknown[];
      renderAll: () => void;
    } | null;
    if (!canvas) return;

    canvas.getObjects().forEach((obj) => {
      const typed = obj as Record<string, unknown>;
      const variableField = typed.variableField as string | undefined;
      if (variableField && typed.text !== undefined) {
        typed.text = fieldValues[variableField] || `{{${variableField}}}`;
      }
    });

    canvas.renderAll();
  }, [fieldValues]);

  return (
    <div className="flex justify-center overflow-hidden rounded-lg border bg-white">
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}
