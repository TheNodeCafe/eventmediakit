"use client";

import { useRef } from "react";
import type { Canvas } from "fabric";
import {
  generateObjectId,
  createRect,
  createTextbox,
} from "./canvas-wrapper";
import { useEditorStore } from "@/store/editor-store";
import {
  Type,
  Heading,
  ImagePlus,
  Square,
  CircleIcon,
  Minus,
  Palette,
} from "lucide-react";

interface ElementsPanelProps {
  canvas: Canvas | null;
  onAdd: () => void;
}

const elements = [
  { id: "heading", label: "Heading", icon: Heading, action: "heading" },
  { id: "text", label: "Text", icon: Type, action: "text" },
  { id: "rectangle", label: "Rectangle", icon: Square, action: "rect" },
  { id: "circle", label: "Cercle", icon: CircleIcon, action: "circle" },
  { id: "divider", label: "Séparateur", icon: Minus, action: "line" },
  { id: "image", label: "Image", icon: ImagePlus, action: "image" },
  { id: "gradient", label: "Dégradé", icon: Palette, action: "gradient" },
];

function getCanvasCenter(): { cx: number; cy: number } {
  const { canvasWidth, canvasHeight } = useEditorStore.getState();
  return { cx: canvasWidth / 2, cy: canvasHeight / 2 };
}

export function ElementsPanel({ canvas, onAdd }: ElementsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAdd(action: string) {
    if (!canvas) return;

    const { Rect, Circle, Line, Textbox, FabricImage, Gradient } =
      await import("fabric");

    const id = generateObjectId();
    const { cx, cy } = getCanvasCenter();

    switch (action) {
      case "heading": {
        const text = new Textbox("Titre", {
          left: cx - 200, top: cy - 24, width: 400,
          fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#1a1a1a", id,
        } as never);
        canvas.add(text);
        canvas.setActiveObject(text);
        break;
      }
      case "text": {
        const text = createTextbox(id);
        text.set({ left: cx - 150, top: cy - 16 } as never);
        canvas.add(text);
        canvas.setActiveObject(text);
        break;
      }
      case "rect": {
        const rect = createRect(id);
        rect.set({ left: cx - 100, top: cy - 75 } as never);
        canvas.add(rect);
        canvas.setActiveObject(rect);
        break;
      }
      case "circle": {
        const circle = new Circle({
          left: cx - 75, top: cy - 75, radius: 75, fill: "#8b5cf6", id,
        } as never);
        canvas.add(circle);
        canvas.setActiveObject(circle);
        break;
      }
      case "line": {
        const line = new Line([cx - 200, cy, cx + 200, cy], {
          stroke: "#e5e5e5", strokeWidth: 2, id,
        } as never);
        canvas.add(line);
        canvas.setActiveObject(line);
        break;
      }
      case "image": {
        fileInputRef.current?.click();
        return;
      }
      case "gradient": {
        const rect = new Rect({
          left: 0, top: 0,
          width: canvas.width! / canvas.getZoom(),
          height: canvas.height! / canvas.getZoom(), id,
        } as never);
        rect.set("fill", new Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: rect.width!, y2: rect.height! },
          colorStops: [
            { offset: 0, color: "#6366f1" },
            { offset: 1, color: "#a855f7" },
          ],
        }));
        canvas.add(rect);
        canvas.setActiveObject(rect);
        break;
      }
    }
    canvas.renderAll();
    onAdd();
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(reader.result as string);
      const scale = Math.min(400 / (img.width ?? 1), 400 / (img.height ?? 1));
      const { cx, cy } = getCanvasCenter();
      const imgW = (img.width ?? 0) * scale;
      const imgH = (img.height ?? 0) * scale;
      img.set({ left: cx - imgW / 2, top: cy - imgH / 2, scaleX: scale, scaleY: scale, id: generateObjectId() } as never);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      onAdd();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex w-[220px] shrink-0 flex-col border-r border-black/[0.06] bg-[#f8f9fa]">
      {/* Elements grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Elements
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {elements.map((el) => (
            <button
              key={el.id}
              onClick={() => handleAdd(el.action)}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.04] bg-white p-3 text-muted-foreground transition-all hover:border-primary/20 hover:shadow-sm hover:text-foreground active:scale-[0.97]"
            >
              <el.icon className="h-[18px] w-[18px] transition-colors group-hover:text-primary" />
              <span className="text-[10px] font-medium">{el.label}</span>
            </button>
          ))}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Background color */}
      <div className="shrink-0 border-t border-black/[0.06] p-3">
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Fond du canvas
        </label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              defaultValue="#ffffff"
              onChange={(e) => {
                if (canvas) { canvas.backgroundColor = e.target.value; canvas.renderAll(); }
              }}
              className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-black/[0.08] bg-transparent p-0.5"
            />
          </div>
          <input
            type="text"
            defaultValue="#ffffff"
            onChange={(e) => {
              if (canvas && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                canvas.backgroundColor = e.target.value;
                canvas.renderAll();
              }
            }}
            className="h-7 flex-1 rounded-lg border border-black/[0.08] bg-white px-2 font-mono text-[11px] text-muted-foreground transition-colors focus:border-primary/30 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
