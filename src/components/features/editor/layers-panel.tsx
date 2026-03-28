"use client";

import { useEffect, useState } from "react";
import type { Canvas, FabricObject } from "fabric";
import { useEditorStore } from "@/store/editor-store";
import { useI18n } from "@/lib/i18n/context";
import {
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Type,
  Square,
  Circle,
  Image,
  Minus,
  Lock,
  Unlock,
} from "lucide-react";

interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}

function getLayerIcon(type: string) {
  switch (type) {
    case "textbox":
    case "i-text":
      return Type;
    case "rect":
      return Square;
    case "circle":
      return Circle;
    case "image":
      return Image;
    case "line":
      return Minus;
    default:
      return Square;
  }
}

function getLayerName(obj: FabricObject): string {
  const typed = obj as unknown as Record<string, unknown>;
  if (typed.text && typeof typed.text === "string") {
    return typed.text.substring(0, 20) + (String(typed.text).length > 20 ? "..." : "");
  }
  const type = (obj.type ?? "object") as string;
  const typeNames: Record<string, string> = {
    textbox: "Texte",
    "i-text": "Texte",
    rect: "Rectangle",
    circle: "Cercle",
    image: "Image",
    line: "Ligne",
    path: "Forme",
    group: "Groupe",
  };
  return typeNames[type] ?? type;
}

interface LayersPanelProps {
  canvas: Canvas | null;
}

export function LayersPanel({ canvas }: LayersPanelProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const { selectedObjectId, setSelectedObjectId } = useEditorStore();
  const { t } = useI18n();

  function syncLayers() {
    if (!canvas) {
      setLayers([]);
      return;
    }

    const objects = canvas.getObjects();
    const items = objects
      .map((obj) => {
        const typed = obj as FabricObject & { id?: string; locked?: boolean };
        return {
          id: typed.id ?? "",
          name: getLayerName(obj),
          type: (obj.type ?? "object") as string,
          visible: obj.visible !== false,
          locked: !!typed.locked,
        };
      })
      .reverse(); // Top layer first

    setLayers(items);
  }

  useEffect(() => {
    syncLayers();

    if (!canvas) return;

    const handler = () => syncLayers();
    canvas.on("object:added", handler);
    canvas.on("object:removed", handler);
    canvas.on("object:modified", handler);
    canvas.on("selection:created", handler);
    canvas.on("selection:cleared", handler);

    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:removed", handler);
      canvas.off("object:modified", handler);
      canvas.off("selection:created", handler);
      canvas.off("selection:cleared", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  function findObject(id: string) {
    return canvas?.getObjects().find(
      (o) => (o as FabricObject & { id?: string }).id === id
    );
  }

  function handleSelect(id: string) {
    if (!canvas) return;
    const obj = findObject(id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      setSelectedObjectId(id);
    }
  }

  function handleToggleVisibility(id: string) {
    const obj = findObject(id);
    if (!obj) return;
    obj.visible = !obj.visible;
    canvas?.renderAll();
    syncLayers();
  }

  function handleToggleLock(id: string) {
    const obj = findObject(id);
    if (!obj || !canvas) return;
    const typed = obj as FabricObject & { locked?: boolean };
    const newLocked = !typed.locked;
    typed.locked = newLocked;
    obj.set({
      selectable: !newLocked,
      evented: !newLocked,
      lockMovementX: newLocked,
      lockMovementY: newLocked,
    } as never);
    if (newLocked) {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
    syncLayers();
    useEditorStore.getState().setIsDirty(true);
  }

  function handleDelete(id: string) {
    const obj = findObject(id);
    if (!obj || !canvas) return;
    canvas.remove(obj);
    canvas.renderAll();
    syncLayers();
  }

  function handleDuplicate(id: string) {
    const obj = findObject(id);
    if (!obj || !canvas) return;
    obj.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
      } as never);
      (cloned as FabricObject & { id: string }).id = crypto.randomUUID();
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      syncLayers();
    });
  }

  function handleMoveUp(id: string) {
    const obj = findObject(id);
    if (!obj || !canvas) return;
    canvas.bringObjectForward(obj);
    canvas.renderAll();
    syncLayers();
  }

  function handleMoveDown(id: string) {
    const obj = findObject(id);
    if (!obj || !canvas) return;
    canvas.sendObjectBackwards(obj);
    canvas.renderAll();
    syncLayers();
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t("editor", "layers")}
        </h3>
        <span className="rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-muted-foreground/40">{layers.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11px] text-muted-foreground/30">
            {t("editor", "addElements")}
          </p>
        ) : (
          <div className="space-y-px px-1.5 pb-2">
            {layers.map((layer) => {
              const isSelected = layer.id === selectedObjectId;
              const Icon = getLayerIcon(layer.type);

              return (
                <div
                  key={layer.id}
                  onClick={() => handleSelect(layer.id)}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/[0.07] text-foreground"
                      : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground"
                  } ${layer.locked ? "opacity-60" : ""}`}
                >
                  <Icon className={`h-3 w-3 shrink-0 ${isSelected ? "text-primary" : ""}`} />
                  <span className="flex-1 truncate font-medium">{layer.name}</span>

                  {/* Action buttons - visible on hover */}
                  <div className="flex shrink-0 items-center gap-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(layer.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-black/[0.06] hover:text-foreground"
                      title={layer.locked ? t("editor", "unlock") : t("editor", "lock")}
                    >
                      {layer.locked ? (
                        <Lock className="h-3 w-3 text-amber-500" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(layer.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-black/[0.06] hover:text-foreground"
                      title="Monter"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(layer.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-black/[0.06] hover:text-foreground"
                      title="Descendre"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(layer.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-black/[0.06] hover:text-foreground"
                      title={layer.visible ? "Masquer" : "Afficher"}
                    >
                      {layer.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground/30" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(layer.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-black/[0.06] hover:text-foreground"
                      title="Dupliquer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(layer.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-red-500/20 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
