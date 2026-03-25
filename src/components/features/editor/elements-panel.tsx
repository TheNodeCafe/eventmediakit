"use client";

import { useRef } from "react";
import type { Canvas } from "fabric";
import { useEditorStore } from "@/store/editor-store";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat } from "@/types";
import {
  generateObjectId,
  createRect,
  createTextbox,
} from "./canvas-wrapper";
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

export function ElementsPanel({ canvas, onAdd }: ElementsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { format, setFormat } = useEditorStore();

  async function handleAdd(action: string) {
    if (!canvas) return;

    const { Rect, Circle, Line, Textbox, FabricImage, Gradient } =
      await import("fabric");

    const id = generateObjectId();

    switch (action) {
      case "heading": {
        const text = new Textbox("Titre", {
          left: 100, top: 100, width: 400,
          fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#1a1a1a", id,
        } as never);
        canvas.add(text);
        canvas.setActiveObject(text);
        break;
      }
      case "text": {
        const text = createTextbox(id);
        canvas.add(text);
        canvas.setActiveObject(text);
        break;
      }
      case "rect": {
        const rect = createRect(id);
        canvas.add(rect);
        canvas.setActiveObject(rect);
        break;
      }
      case "circle": {
        const circle = new Circle({
          left: 100, top: 100, radius: 75, fill: "#8b5cf6", id,
        } as never);
        canvas.add(circle);
        canvas.setActiveObject(circle);
        break;
      }
      case "line": {
        const line = new Line([50, 200, 450, 200], {
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
      img.set({ left: 100, top: 100, scaleX: scale, scaleY: scale, id: generateObjectId() } as never);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      onAdd();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const formats: { key: TemplateFormat; label: string }[] = [
    { key: "story_9x16", label: "Story" },
    { key: "square_1x1", label: "Carré" },
    { key: "landscape_16x9", label: "Paysage" },
    { key: "linkedin_banner", label: "LinkedIn" },
  ];

  return (
    <div className="flex w-60 flex-col border-r bg-white">
      {/* Elements grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Éléments
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {elements.map((el) => (
            <button
              key={el.id}
              onClick={() => handleAdd(el.action)}
              className="flex flex-col items-center gap-1 rounded-lg border border-transparent p-2.5 text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              <el.icon className="h-5 w-5" />
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

      {/* Canvas settings */}
      <div className="border-t p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Canvas
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Format</label>
            <div className="flex flex-wrap gap-1">
              {formats.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    const preset = FORMAT_PRESETS[f.key];
                    setFormat(f.key, preset.width, preset.height);
                  }}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                    format === f.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                defaultValue="#ffffff"
                onChange={(e) => {
                  if (canvas) { canvas.backgroundColor = e.target.value; canvas.renderAll(); }
                }}
                className="h-7 w-7 cursor-pointer rounded border"
              />
              <input
                type="text"
                defaultValue="#ffffff"
                onChange={(e) => {
                  if (canvas && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    canvas.backgroundColor = e.target.value;
                    canvas.renderAll();
                  }
                }}
                className="h-7 flex-1 rounded border px-2 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
