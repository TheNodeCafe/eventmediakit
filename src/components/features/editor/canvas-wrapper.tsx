"use client";

import { useEffect, useRef, useCallback } from "react";
import { Canvas, Rect, Textbox, FabricImage, FabricObject } from "fabric";
import { useEditorStore } from "@/store/editor-store";
import { CUSTOM_PROPERTIES } from "@/lib/fabric/variable-fields";

// Register custom properties for serialization
FabricObject.customProperties = [...CUSTOM_PROPERTIES];

interface CanvasWrapperProps {
  onCanvasReady: (canvas: Canvas) => void;
  initialJson?: Record<string, unknown>;
}

export function CanvasWrapper({
  onCanvasReady,
  initialJson,
}: CanvasWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const { canvasWidth, canvasHeight, zoom, setSelectedObjectId, setIsDirty } =
    useEditorStore();

  const initCanvas = useCallback(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth * zoom,
      height: canvasHeight * zoom,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    canvas.setZoom(zoom);

    // Selection events
    canvas.on("selection:created", (e) => {
      const id = (e.selected?.[0] as FabricObject & { id?: string })?.id;
      setSelectedObjectId(id ?? null);
    });

    canvas.on("selection:updated", (e) => {
      const id = (e.selected?.[0] as FabricObject & { id?: string })?.id;
      setSelectedObjectId(id ?? null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObjectId(null);
    });

    // Track changes
    canvas.on("object:modified", () => setIsDirty(true));
    canvas.on("object:added", () => setIsDirty(true));
    canvas.on("object:removed", () => setIsDirty(true));

    // Load initial JSON if provided
    if (initialJson && Object.keys(initialJson).length > 0) {
      canvas.loadFromJSON(initialJson).then(() => {
        canvas.renderAll();
      });
    }

    fabricRef.current = canvas;
    onCanvasReady(canvas);

    return canvas;
  }, [canvasWidth, canvasHeight, zoom, initialJson, onCanvasReady, setSelectedObjectId, setIsDirty]);

  useEffect(() => {
    const canvas = initCanvas();
    return () => {
      canvas?.dispose();
      fabricRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update zoom when it changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.setDimensions({
      width: canvasWidth * zoom,
      height: canvasHeight * zoom,
    });
    canvas.renderAll();
  }, [zoom, canvasWidth, canvasHeight]);

  return (
    <div className="flex items-center justify-center overflow-auto bg-muted/50 p-8">
      <div className="shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// Utility to generate unique IDs for objects
let objectCounter = 0;
export function generateObjectId(): string {
  return `obj_${Date.now()}_${++objectCounter}`;
}

// Factory functions for creating canvas objects
export function createRect(id: string): Rect {
  return new Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    fill: "#6366f1",
    rx: 8,
    ry: 8,
    id,
  } as Partial<Rect> & { id: string });
}

export function createTextbox(id: string, text: string = "Texte"): Textbox {
  return new Textbox(text, {
    left: 100,
    top: 100,
    width: 300,
    fontSize: 32,
    fontFamily: "Arial",
    fill: "#1a1a1a",
    id,
  } as Partial<Textbox> & { id: string });
}

export async function createImageFromUrl(
  id: string,
  url: string
): Promise<FabricImage> {
  const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  img.set({
    left: 100,
    top: 100,
    scaleX: 0.5,
    scaleY: 0.5,
    id,
  } as Partial<FabricImage> & { id: string });
  return img;
}
