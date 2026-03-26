"use client";

import { useEffect, useRef, useCallback } from "react";
import { Canvas, Rect, Textbox, FabricImage, FabricObject, Line } from "fabric";
import { useEditorStore } from "@/store/editor-store";
import { CUSTOM_PROPERTIES } from "@/lib/fabric/variable-fields";

FabricObject.customProperties = [...CUSTOM_PROPERTIES];

const SNAP_THRESHOLD = 10;

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
  const guideLinesRef = useRef<FabricObject[]>([]);
  const { canvasWidth, canvasHeight, zoom, setSelectedObjectId, setIsDirty } =
    useEditorStore();

  // Keep current dimensions in refs so event handlers always have latest values
  const dimsRef = useRef({ w: canvasWidth, h: canvasHeight, z: zoom });
  dimsRef.current = { w: canvasWidth, h: canvasHeight, z: zoom };

  function clearGuides(canvas: Canvas) {
    guideLinesRef.current.forEach((g) => canvas.remove(g));
    guideLinesRef.current = [];
  }

  function addGuide(canvas: Canvas, x1: number, y1: number, x2: number, y2: number) {
    const z = dimsRef.current.z;
    const line = new Line([x1, y1, x2, y2], {
      stroke: "#6366f1",
      strokeWidth: 1.5 / z,
      strokeDashArray: [6 / z, 4 / z],
      selectable: false,
      evented: false,
      excludeFromExport: true,
      opacity: 0.9,
    } as never);
    canvas.add(line);
    canvas.bringObjectToFront(line);
    guideLinesRef.current.push(line);
  }

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
    canvas.on("object:modified", () => {
      setIsDirty(true);
      clearGuides(canvas);
    });
    canvas.on("object:added", () => setIsDirty(true));
    canvas.on("object:removed", () => setIsDirty(true));

    // Snapping guides — uses dimsRef for always-current values
    canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      clearGuides(canvas);

      const { w: cW, h: cH } = dimsRef.current;
      const objLeft = obj.left ?? 0;
      const objTop = obj.top ?? 0;
      const objWidth = (obj.width ?? 0) * (obj.scaleX ?? 1);
      const objHeight = (obj.height ?? 0) * (obj.scaleY ?? 1);
      const objCenterX = objLeft + objWidth / 2;
      const objCenterY = objTop + objHeight / 2;
      const objRight = objLeft + objWidth;
      const objBottom = objTop + objHeight;

      let snappedX = false;
      let snappedY = false;

      // Horizontal center
      if (Math.abs(objCenterX - cW / 2) < SNAP_THRESHOLD) {
        obj.set("left", cW / 2 - objWidth / 2);
        addGuide(canvas, cW / 2, 0, cW / 2, cH);
        snappedX = true;
      }
      // Left edge
      if (!snappedX && Math.abs(objLeft) < SNAP_THRESHOLD) {
        obj.set("left", 0);
        addGuide(canvas, 0, 0, 0, cH);
      }
      // Right edge
      if (!snappedX && Math.abs(objRight - cW) < SNAP_THRESHOLD) {
        obj.set("left", cW - objWidth);
        addGuide(canvas, cW, 0, cW, cH);
      }

      // Vertical center
      if (Math.abs(objCenterY - cH / 2) < SNAP_THRESHOLD) {
        obj.set("top", cH / 2 - objHeight / 2);
        addGuide(canvas, 0, cH / 2, cW, cH / 2);
        snappedY = true;
      }
      // Top edge
      if (!snappedY && Math.abs(objTop) < SNAP_THRESHOLD) {
        obj.set("top", 0);
        addGuide(canvas, 0, 0, cW, 0);
      }
      // Bottom edge
      if (!snappedY && Math.abs(objBottom - cH) < SNAP_THRESHOLD) {
        obj.set("top", cH - objHeight);
        addGuide(canvas, 0, cH, cW, cH);
      }

      canvas.renderAll();
    });

    // Load initial JSON
    if (initialJson && Object.keys(initialJson).length > 0) {
      canvas.loadFromJSON(initialJson).then(() => {
        canvas.renderAll();
      });
    }

    fabricRef.current = canvas;
    onCanvasReady(canvas);

    return canvas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = initCanvas();
    return () => {
      canvas?.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update zoom/dimensions
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
    <div className="relative flex h-full items-center justify-center overflow-auto p-8">
      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/90 px-1 py-0.5 shadow-sm backdrop-blur-sm">
        <button
          onClick={() => useEditorStore.getState().setZoom(Math.max(zoom - 0.1, 0.1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
        >
          -
        </button>
        <button
          onClick={() => {
            const container = canvasRef.current?.parentElement?.parentElement;
            if (!container) return;
            const padding = 80;
            const scaleX = (container.clientWidth - padding) / canvasWidth;
            const scaleY = (container.clientHeight - padding) / canvasHeight;
            useEditorStore.getState().setZoom(Math.min(scaleX, scaleY, 1));
          }}
          className="rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums text-foreground transition-colors hover:bg-black/[0.04]"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => useEditorStore.getState().setZoom(Math.min(zoom + 0.1, 2))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
        >
          +
        </button>
      </div>

      <div className="rounded-sm shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
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

// Factory: rectangle WITHOUT rounded corners by default
export function createRect(id: string): Rect {
  return new Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    fill: "#6366f1",
    rx: 0,
    ry: 0,
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
