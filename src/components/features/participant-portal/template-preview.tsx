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

  const fieldValuesRef = useRef(fieldValues);
  fieldValuesRef.current = fieldValues;

  const injectValues = useCallback(
    async (
      canvas: { getObjects: () => unknown[]; renderAll: () => void },
      values: Record<string, string>
    ) => {
      const objects = canvas.getObjects();

      for (const obj of objects) {
        const typed = obj as Record<string, unknown>;
        const variableField = typed.variableField as string | undefined;
        if (!variableField) continue;

        const value = values[variableField];

        // Text fields
        if (typed.text !== undefined) {
          const newText = value || `{{${variableField}}}`;
          const fabricObj = obj as {
            set?: (key: string, value: unknown) => void;
          };
          if (typeof fabricObj.set === "function") {
            fabricObj.set("text", newText);
          } else {
            typed.text = newText;
          }
        }

        // Image fields: apply image as fill pattern on the shape
        if (value && (value.startsWith("blob:") || value.startsWith("data:") || value.startsWith("http"))) {
          // This is an image URL — apply as pattern fill
          if (typed.text === undefined) {
            try {
              const { FabricImage, Pattern } = await import("fabric");
              const img = await FabricImage.fromURL(value);
              const objWidth = ((typed.width as number) ?? 100) * ((typed.scaleX as number) ?? 1);
              const objHeight = ((typed.height as number) ?? 100) * ((typed.scaleY as number) ?? 1);
              // For circles, use radius * 2
              const shapeW = (typed.radius as number) ? (typed.radius as number) * 2 : objWidth / ((typed.scaleX as number) ?? 1);
              const shapeH = (typed.radius as number) ? (typed.radius as number) * 2 : objHeight / ((typed.scaleY as number) ?? 1);

              // Scale image to cover the shape
              const imgScale = Math.max(
                shapeW / (img.width ?? 1),
                shapeH / (img.height ?? 1)
              );
              img.set({
                scaleX: imgScale,
                scaleY: imgScale,
                originX: "center",
                originY: "center",
                left: shapeW / 2,
                top: shapeH / 2,
              } as never);

              const pattern = new Pattern({
                source: img.toCanvasElement(),
                repeat: "no-repeat",
              });

              const fabricObj = obj as {
                set?: (key: string, value: unknown) => void;
              };
              if (typeof fabricObj.set === "function") {
                fabricObj.set("fill", pattern);
              }
            } catch (e) {
              console.warn("Failed to load image for variable field:", e);
            }
          }
        }
      }

      canvas.renderAll();
    },
    []
  );

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

      await injectValues(canvas, fieldValuesRef.current);

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
