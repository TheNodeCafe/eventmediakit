"use client";

import { useRef } from "react";
import type { Canvas, FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/editor-store";
import {
  generateObjectId,
  createRect,
  createTextbox,
} from "./canvas-wrapper";
import {
  Square,
  Type,
  ImagePlus,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Layers,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ToolbarProps {
  canvas: Canvas | null;
}

export function Toolbar({ canvas }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { zoom, setZoom, selectedObjectId } = useEditorStore();

  function handleAddRect() {
    if (!canvas) return;
    const rect = createRect(generateObjectId());
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }

  function handleAddText() {
    if (!canvas) return;
    const text = createTextbox(generateObjectId());
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(reader.result as string);
      const maxSize = 400;
      const scale = Math.min(
        maxSize / (img.width ?? 1),
        maxSize / (img.height ?? 1)
      );
      img.set({
        left: 100,
        top: 100,
        scaleX: scale,
        scaleY: scale,
        id: generateObjectId(),
      } as Partial<typeof img> & { id: string });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleDelete() {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  }

  function handleDuplicate() {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
        id: generateObjectId(),
      } as Partial<typeof cloned> & { id: string });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }

  function handleBringForward() {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      canvas.renderAll();
    }
  }

  function handleSendBackward() {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectBackwards(active);
      canvas.renderAll();
    }
  }

  function handleZoomIn() {
    setZoom(Math.min(zoom + 0.1, 1.5));
  }

  function handleZoomOut() {
    setZoom(Math.max(zoom - 0.1, 0.2));
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-background px-4 py-2">
      {/* Add shapes */}
      <Button variant="ghost" size="icon" onClick={handleAddRect} title="Rectangle">
        <Square className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleAddText} title="Texte">
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        title="Image"
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Object actions */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDuplicate}
        disabled={!selectedObjectId}
        title="Dupliquer"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={!selectedObjectId}
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Layering */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBringForward}
        disabled={!selectedObjectId}
        title="Avancer"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSendBackward}
        disabled={!selectedObjectId}
        title="Reculer"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Zoom */}
      <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Dézoomer">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoomer">
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}
