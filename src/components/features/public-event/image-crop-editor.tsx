"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ZoomIn, ZoomOut, Check } from "lucide-react";

interface ImageCropEditorProps {
  imageUrl: string;
  onConfirm: (croppedUrl: string) => void;
  onRemove: () => void;
}

export function ImageCropEditor({ imageUrl, onConfirm, onRemove }: ImageCropEditorProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  function handleConfirm() {
    // Render to canvas at the cropped view
    const canvas = canvasRef.current;
    if (!canvas) { onConfirm(imageUrl); return; }

    const ctx = canvas.getContext("2d");
    if (!ctx) { onConfirm(imageUrl); return; }

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const drawSize = size * zoom;
      const offsetX = (size - drawSize) / 2 + position.x;
      const offsetY = (size - drawSize) / 2 + position.y;
      ctx.drawImage(img, offsetX, offsetY, drawSize, drawSize);
      onConfirm(canvas.toDataURL("image/png"));
    };
    img.onerror = () => onConfirm(imageUrl);
    img.src = imageUrl;
  }

  return (
    <div className="space-y-3">
      {/* Preview area */}
      <div
        className="relative mx-auto h-48 w-48 cursor-move overflow-hidden rounded-xl border-2 border-border bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlNWU1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=')]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt=""
          className="pointer-events-none absolute h-full w-full object-cover"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transformOrigin: "center",
          }}
          draggable={false}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-2 px-4">
        <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-primary"
        />
        <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Retirer
        </Button>
        <Button size="sm" onClick={handleConfirm}>
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Valider
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
