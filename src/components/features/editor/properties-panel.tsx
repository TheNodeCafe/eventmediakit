"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Canvas, FabricObject, Textbox, Gradient } from "fabric";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store/editor-store";
import { VARIABLE_FIELD_PROPERTY } from "@/lib/fabric/variable-fields";
import type { VariableFieldDefinition } from "@/types";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag,
  RotateCw,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  FlipHorizontal,
  FlipVertical,
  ImagePlus,
} from "lucide-react";

interface PropertiesPanelProps {
  canvas: Canvas | null;
  variableFields: VariableFieldDefinition[];
}

interface ObjectProps {
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  fill: string;
  fillType: "solid" | "gradient";
  gradientColor1?: string;
  gradientColor2?: string;
  opacity: number;
  rx?: number;
  ry?: number;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  variableField: string;
  // Image fit mode
  imageFitMode?: "fill" | "contain" | "cover";
  flipX?: boolean;
  flipY?: boolean;
  // Shadow
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
}

const FONTS = [
  "Arial", "Helvetica", "Inter", "Georgia", "Times New Roman",
  "Courier New", "Verdana", "Impact", "Trebuchet MS", "Tahoma",
  "Comic Sans MS", "Palatino",
];

export function PropertiesPanel({ canvas, variableFields }: PropertiesPanelProps) {
  const { selectedObjectId, canvasWidth, canvasHeight } = useEditorStore();
  const [props, setProps] = useState<ObjectProps | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const syncProps = useCallback(() => {
    if (!canvas || !selectedObjectId) { setProps(null); return; }
    const obj = canvas.getObjects().find(
      (o) => (o as FabricObject & { id?: string }).id === selectedObjectId
    );
    if (!obj) { setProps(null); return; }

    const t = obj as FabricObject & Record<string, unknown>;
    const fill = t.fill;
    let fillType: "solid" | "gradient" = "solid";
    let gradientColor1 = "#6366f1";
    let gradientColor2 = "#a855f7";
    let solidFill = "#000000";

    if (fill && typeof fill === "object" && "colorStops" in fill) {
      fillType = "gradient";
      const stops = (fill as Gradient<"linear">).colorStops ?? [];
      gradientColor1 = (stops[0]?.color as string) ?? "#6366f1";
      gradientColor2 = (stops[1]?.color as string) ?? "#a855f7";
    } else {
      solidFill = (fill as string) ?? "#000000";
    }

    const shadow = obj.shadow as { color?: string; offsetX?: number; offsetY?: number; blur?: number } | null;

    setProps({
      type: (obj.type ?? "object") as string,
      left: Math.round(obj.left ?? 0),
      top: Math.round(obj.top ?? 0),
      width: Math.round((obj.width ?? 0) * (obj.scaleX ?? 1)),
      height: Math.round((obj.height ?? 0) * (obj.scaleY ?? 1)),
      scaleX: obj.scaleX ?? 1,
      scaleY: obj.scaleY ?? 1,
      angle: Math.round(obj.angle ?? 0),
      fill: solidFill,
      fillType,
      gradientColor1,
      gradientColor2,
      opacity: obj.opacity ?? 1,
      rx: (t.rx as number) ?? 0,
      ry: (t.ry as number) ?? 0,
      stroke: (obj.stroke as string) ?? "",
      strokeWidth: obj.strokeWidth ?? 0,
      fontSize: t.fontSize as number | undefined,
      fontFamily: t.fontFamily as string | undefined,
      fontWeight: t.fontWeight as string | undefined,
      fontStyle: t.fontStyle as string | undefined,
      underline: t.underline as boolean | undefined,
      textAlign: t.textAlign as string | undefined,
      lineHeight: t.lineHeight as number | undefined,
      charSpacing: t.charSpacing as number | undefined,
      variableField: (t[VARIABLE_FIELD_PROPERTY] as string) ?? "",
      imageFitMode: (t.imageFitMode as "fill" | "contain" | "cover") ?? "fill",
      flipX: !!obj.flipX,
      flipY: !!obj.flipY,
      shadowEnabled: !!shadow,
      shadowColor: shadow?.color ?? "#000000",
      shadowOffsetX: shadow?.offsetX ?? 4,
      shadowOffsetY: shadow?.offsetY ?? 4,
      shadowBlur: shadow?.blur ?? 8,
    });
  }, [canvas, selectedObjectId]);

  useEffect(() => { syncProps(); }, [syncProps]);

  useEffect(() => {
    if (!canvas) return;
    const h = () => syncProps();
    canvas.on("selection:created", h);
    canvas.on("selection:updated", h);
    canvas.on("selection:cleared", h);
    canvas.on("object:modified", h);
    canvas.on("object:scaling", h);
    canvas.on("object:rotating", h);
    canvas.on("object:moving", h);
    return () => {
      canvas.off("selection:created", h);
      canvas.off("selection:updated", h);
      canvas.off("selection:cleared", h);
      canvas.off("object:modified", h);
      canvas.off("object:scaling", h);
      canvas.off("object:rotating", h);
      canvas.off("object:moving", h);
    };
  }, [canvas, syncProps]);

  function getObj() {
    if (!canvas) return null;
    return canvas.getActiveObject() as (FabricObject & Record<string, unknown>) | null;
  }

  function update(key: string, value: unknown) {
    const obj = getObj();
    if (!obj) return;
    obj.set(key as never, value as never);
    canvas?.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  function updateGradient(color1: string, color2: string) {
    const obj = getObj();
    if (!obj || !canvas) return;
    import("fabric").then(({ Gradient }) => {
      obj.set("fill", new Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: (obj.width ?? 200), y2: (obj.height ?? 200) },
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 1, color: color2 },
        ],
      }));
      canvas.renderAll();
      syncProps();
      useEditorStore.getState().setIsDirty(true);
    });
  }

  function handleVariableChange(value: string | null) {
    if (!value) return;
    const obj = getObj();
    if (!obj) return;
    const fv = value === "__none__" ? "" : value;
    (obj as unknown as Record<string, unknown>)[VARIABLE_FIELD_PROPERTY] = fv;
    if (obj.text !== undefined && fv) {
      const fd = variableFields.find((f) => f.name === fv);
      if (fd) (obj as unknown as Textbox).set("text", `{{${fd.label}}}`);
    }
    canvas?.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  // Alignment helpers
  function alignObject(alignment: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") {
    const obj = getObj();
    if (!obj || !canvas) return;
    const objW = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const objH = (obj.height ?? 0) * (obj.scaleY ?? 1);
    switch (alignment) {
      case "left": obj.set("left", 0); break;
      case "centerH": obj.set("left", canvasWidth / 2 - objW / 2); break;
      case "right": obj.set("left", canvasWidth - objW); break;
      case "top": obj.set("top", 0); break;
      case "centerV": obj.set("top", canvasHeight / 2 - objH / 2); break;
      case "bottom": obj.set("top", canvasHeight - objH); break;
    }
    obj.setCoords();
    canvas.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  // Image fit mode
  function applyImageFitMode(mode: "fill" | "contain" | "cover") {
    const obj = getObj();
    if (!obj || !canvas) return;
    // Store the mode as custom property
    (obj as unknown as Record<string, unknown>).imageFitMode = mode;

    // Get the current bounding box dimensions
    const boxW = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const boxH = (obj.height ?? 0) * (obj.scaleY ?? 1);
    const origW = obj.width ?? 1;
    const origH = obj.height ?? 1;

    switch (mode) {
      case "fill": {
        // Stretch to fill bounding box, clear clipPath
        obj.set("scaleX" as never, (boxW / origW) as never);
        obj.set("scaleY" as never, (boxH / origH) as never);
        obj.set("clipPath" as never, undefined as never);
        break;
      }
      case "contain": {
        const scale = Math.min(boxW / origW, boxH / origH);
        obj.set("scaleX" as never, scale as never);
        obj.set("scaleY" as never, scale as never);
        obj.set("clipPath" as never, undefined as never);
        break;
      }
      case "cover": {
        const scale = Math.max(boxW / origW, boxH / origH);
        obj.set("scaleX" as never, scale as never);
        obj.set("scaleY" as never, scale as never);
        // Set clipPath rect to original bounding box size
        import("fabric").then(({ Rect }) => {
          const clipRect = new Rect({
            width: boxW / scale,
            height: boxH / scale,
            originX: "center",
            originY: "center",
          });
          obj.set("clipPath" as never, clipRect as never);
          canvas.renderAll();
        });
        break;
      }
    }
    canvas.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  function handleReplaceImage(e: React.ChangeEvent<HTMLInputElement>) {
    const obj = getObj();
    if (!obj || !canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const { FabricImage } = await import("fabric");
      const newImg = await FabricImage.fromURL(reader.result as string);
      // Keep position and scale
      newImg.set({
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle,
      } as never);
      const typed = obj as FabricObject & { id?: string };
      (newImg as FabricObject & { id?: string }).id = typed.id;
      canvas.remove(obj);
      canvas.add(newImg);
      canvas.setActiveObject(newImg);
      canvas.renderAll();
      syncProps();
      useEditorStore.getState().setIsDirty(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Shadow
  function toggleShadow(enabled: boolean) {
    const obj = getObj();
    if (!obj || !canvas) return;
    if (enabled) {
      import("fabric").then(({ Shadow }) => {
        obj.set("shadow" as never, new Shadow({
          color: props?.shadowColor ?? "#000000",
          offsetX: props?.shadowOffsetX ?? 4,
          offsetY: props?.shadowOffsetY ?? 4,
          blur: props?.shadowBlur ?? 8,
        }) as never);
        canvas.renderAll();
        syncProps();
        useEditorStore.getState().setIsDirty(true);
      });
    } else {
      obj.set("shadow" as never, null as never);
      canvas.renderAll();
      syncProps();
      useEditorStore.getState().setIsDirty(true);
    }
  }

  function updateShadow(key: string, value: unknown) {
    const obj = getObj();
    if (!obj || !canvas) return;
    const shadow = obj.shadow as Record<string, unknown> | null;
    if (!shadow) return;
    (shadow as Record<string, unknown>)[key] = value;
    // Force re-render by reassigning
    obj.set("shadow" as never, shadow as never);
    obj.dirty = true;
    canvas.renderAll();
    syncProps();
    useEditorStore.getState().setIsDirty(true);
  }

  const isText = props?.type === "textbox" || props?.type === "i-text";
  const isRect = props?.type === "rect";
  const isImage = props?.type === "image";

  if (!props) {
    return (
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Properties
        </h3>
        <p className="py-12 text-center text-[12px] text-muted-foreground/40">
          Selectionner un element
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3">
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        Properties
      </h3>

      <div className="space-y-3">
        {/* === VARIABLE ZONE === */}
        {variableFields.length > 0 && (
          <Section
            className={props.variableField ? "border-orange-200 bg-orange-50/60" : "border-dashed border-black/[0.08] bg-black/[0.01]"}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-500">Variable</span>
            </div>
            <Select value={props.variableField || "__none__"} onValueChange={handleVariableChange}>
              <SelectTrigger className="h-7 rounded-lg border-black/[0.08] text-[12px] shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Element fixe</SelectItem>
                {variableFields.map((f) => (
                  <SelectItem key={f.id} value={f.name}>{f.label} — {f.field_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {props.variableField && (
              <p className="mt-1.5 text-[10px] text-orange-400">Rempli par le visiteur</p>
            )}
          </Section>
        )}

        {/* === POSITION & SIZE === */}
        <div>
          <SectionLabel>Position & Taille</SectionLabel>
          {/* Alignment buttons */}
          <div className="mb-2 flex items-center gap-0.5">
            <ToggleBtn active={false} onClick={() => alignObject("left")}>
              <AlignHorizontalJustifyStart className="h-3.5 w-3.5" />
            </ToggleBtn>
            <ToggleBtn active={false} onClick={() => alignObject("centerH")}>
              <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
            </ToggleBtn>
            <ToggleBtn active={false} onClick={() => alignObject("right")}>
              <AlignHorizontalJustifyEnd className="h-3.5 w-3.5" />
            </ToggleBtn>
            <div className="mx-0.5 h-4 w-px bg-black/[0.06]" />
            <ToggleBtn active={false} onClick={() => alignObject("top")}>
              <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
            </ToggleBtn>
            <ToggleBtn active={false} onClick={() => alignObject("centerV")}>
              <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
            </ToggleBtn>
            <ToggleBtn active={false} onClick={() => alignObject("bottom")}>
              <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
            </ToggleBtn>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumInput label="X" value={props.left} onChange={(v) => update("left", v)} />
            <NumInput label="Y" value={props.top} onChange={(v) => update("top", v)} />
            <NumInput label="L" value={props.width} onChange={(v) => {
              const obj = getObj();
              if (obj) { obj.set("scaleX", v / (obj.width ?? 1)); canvas?.renderAll(); syncProps(); }
            }} />
            <NumInput label="H" value={props.height} onChange={(v) => {
              const obj = getObj();
              if (obj) { obj.set("scaleY", v / (obj.height ?? 1)); canvas?.renderAll(); syncProps(); }
            }} />
          </div>
        </div>

        {/* === ROTATION === */}
        <div>
          <SectionLabel>Rotation</SectionLabel>
          <div className="flex items-center gap-1.5">
            <RotateCw className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            <Input
              type="number"
              value={props.angle}
              onChange={(e) => update("angle", parseInt(e.target.value) || 0)}
              className="h-7 w-16 rounded-lg border-black/[0.08] text-center text-[12px] shadow-none"
              min={0}
              max={360}
            />
            <span className="text-[10px] text-muted-foreground/50">deg</span>
            <div className="flex gap-0.5 ml-auto">
              {[0, 45, 90, 180, 270].map((a) => (
                <button
                  key={a}
                  onClick={() => update("angle", a)}
                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                    props.angle === a ? "bg-primary/10 text-primary" : "text-muted-foreground/50 hover:bg-black/[0.04] hover:text-muted-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === IMAGE CONTROLS === */}
        {isImage && (
          <div className="space-y-2">
            <SectionLabel>Image</SectionLabel>
            {/* Fit mode segmented buttons */}
            <div className="flex items-center gap-0.5 rounded-lg bg-black/[0.04] p-0.5">
              {(["fill", "contain", "cover"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => applyImageFitMode(mode)}
                  className={`flex-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                    props.imageFitMode === mode
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "fill" ? "Remplir" : mode === "contain" ? "Contenir" : "Couvrir"}
                </button>
              ))}
            </div>
            {/* Flip & Replace */}
            <div className="flex items-center gap-1">
              <ToggleBtn active={!!props.flipX} onClick={() => update("flipX", !props.flipX)}>
                <FlipHorizontal className="h-3.5 w-3.5" />
              </ToggleBtn>
              <ToggleBtn active={!!props.flipY} onClick={() => update("flipY", !props.flipY)}>
                <FlipVertical className="h-3.5 w-3.5" />
              </ToggleBtn>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="ml-auto flex items-center gap-1 rounded-lg border border-black/[0.08] px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
              >
                <ImagePlus className="h-3 w-3" />
                Remplacer
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReplaceImage}
              />
            </div>
          </div>
        )}

        {/* === TEXT CONTROLS === */}
        {isText && (
          <div className="space-y-2">
            <SectionLabel>Texte</SectionLabel>
            <div className="flex gap-1.5">
              <Select value={props.fontFamily ?? "Arial"} onValueChange={(v) => v && update("fontFamily", v)}>
                <SelectTrigger className="h-7 flex-1 rounded-lg border-black/[0.08] text-[12px] shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={props.fontSize ?? 16}
                onChange={(e) => update("fontSize", parseInt(e.target.value) || 16)}
                className="h-7 w-14 rounded-lg border-black/[0.08] text-center text-[12px] shadow-none"
              />
            </div>
            {/* Style buttons */}
            <div className="flex items-center gap-0.5">
              <ToggleBtn active={props.fontWeight === "bold"} onClick={() => update("fontWeight", props.fontWeight === "bold" ? "normal" : "bold")}>
                <Bold className="h-3.5 w-3.5" />
              </ToggleBtn>
              <ToggleBtn active={props.fontStyle === "italic"} onClick={() => update("fontStyle", props.fontStyle === "italic" ? "normal" : "italic")}>
                <Italic className="h-3.5 w-3.5" />
              </ToggleBtn>
              <ToggleBtn active={!!props.underline} onClick={() => update("underline", !props.underline)}>
                <Underline className="h-3.5 w-3.5" />
              </ToggleBtn>
              <div className="mx-1 h-4 w-px bg-black/[0.06]" />
              <ToggleBtn active={props.textAlign === "left"} onClick={() => update("textAlign", "left")}>
                <AlignLeft className="h-3.5 w-3.5" />
              </ToggleBtn>
              <ToggleBtn active={props.textAlign === "center"} onClick={() => update("textAlign", "center")}>
                <AlignCenter className="h-3.5 w-3.5" />
              </ToggleBtn>
              <ToggleBtn active={props.textAlign === "right"} onClick={() => update("textAlign", "right")}>
                <AlignRight className="h-3.5 w-3.5" />
              </ToggleBtn>
            </div>
            {/* Line height & letter spacing */}
            <div className="grid grid-cols-2 gap-1.5">
              <NumInput label="Interligne" value={Math.round((props.lineHeight ?? 1.2) * 100) / 100} onChange={(v) => update("lineHeight", v)} step={0.1} />
              <NumInput label="Espacement" value={props.charSpacing ?? 0} onChange={(v) => update("charSpacing", v)} step={10} />
            </div>
          </div>
        )}

        {/* === FILL COLOR === */}
        <div>
          <SectionLabel>Couleur</SectionLabel>
          {props.fillType === "gradient" ? (
            <div className="flex items-center gap-2">
              <input type="color" value={props.gradientColor1} onChange={(e) => updateGradient(e.target.value, props.gradientColor2 ?? "#a855f7")} className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-black/[0.08] bg-transparent p-0.5" />
              <span className="text-[10px] text-muted-foreground/40">→</span>
              <input type="color" value={props.gradientColor2} onChange={(e) => updateGradient(props.gradientColor1 ?? "#6366f1", e.target.value)} className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-black/[0.08] bg-transparent p-0.5" />
              <span className="ml-auto text-[10px] text-muted-foreground/40">Gradient</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="color" value={props.fill} onChange={(e) => update("fill", e.target.value)} className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-black/[0.08] bg-transparent p-0.5" />
              <Input value={props.fill} onChange={(e) => update("fill", e.target.value)} className="h-7 rounded-lg border-black/[0.08] font-mono text-[11px] shadow-none" />
            </div>
          )}
        </div>

        {/* === BORDER RADIUS (rect only) === */}
        {isRect && (
          <div>
            <SectionLabel>Coins arrondis</SectionLabel>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={props.rx ?? 0}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  update("rx", v);
                  update("ry", v);
                }}
                className="flex-1 accent-primary"
              />
              <span className="w-8 text-center text-[11px] tabular-nums text-muted-foreground/60">{props.rx ?? 0}</span>
            </div>
          </div>
        )}

        {/* === STROKE === */}
        <div>
          <SectionLabel>Bordure</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={props.stroke || "#000000"}
              onChange={(e) => update("stroke", e.target.value)}
              className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-black/[0.08] bg-transparent p-0.5"
            />
            <Input
              type="number"
              value={props.strokeWidth ?? 0}
              onChange={(e) => update("strokeWidth", parseInt(e.target.value) || 0)}
              className="h-7 w-14 rounded-lg border-black/[0.08] text-center text-[12px] shadow-none"
              min={0}
              placeholder="0"
            />
            <span className="text-[10px] text-muted-foreground/40">px</span>
          </div>
        </div>

        {/* === SHADOW === */}
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel>Ombre</SectionLabel>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={!!props.shadowEnabled}
                onChange={(e) => toggleShadow(e.target.checked)}
                className="h-3 w-3 rounded accent-primary"
              />
              <span className="text-[10px] text-muted-foreground/50">{props.shadowEnabled ? "On" : "Off"}</span>
            </label>
          </div>
          {props.shadowEnabled && (
            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={props.shadowColor ?? "#000000"}
                  onChange={(e) => updateShadow("color", e.target.value)}
                  className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-black/[0.08] bg-transparent p-0.5"
                />
                <Input
                  value={props.shadowColor ?? "#000000"}
                  onChange={(e) => updateShadow("color", e.target.value)}
                  className="h-7 rounded-lg border-black/[0.08] font-mono text-[11px] shadow-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <NumInput label="X" value={props.shadowOffsetX ?? 4} onChange={(v) => updateShadow("offsetX", v)} />
                <NumInput label="Y" value={props.shadowOffsetY ?? 4} onChange={(v) => updateShadow("offsetY", v)} />
                <NumInput label="Flou" value={props.shadowBlur ?? 8} onChange={(v) => updateShadow("blur", v)} />
              </div>
            </div>
          )}
        </div>

        {/* === OPACITY === */}
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel>Opacite</SectionLabel>
            <span className="text-[10px] tabular-nums text-muted-foreground/50">{Math.round(props.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={props.opacity}
            onChange={(e) => update("opacity", parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
}

// Small helper components
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">{children}</label>;
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border p-2.5 ${className ?? ""}`}>{children}</div>;
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground/50 hover:bg-black/[0.04] hover:text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

function NumInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-4 text-[10px] font-medium text-muted-foreground/50">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="h-7 rounded-lg border-black/[0.08] text-center text-[11px] tabular-nums shadow-none"
        step={step}
      />
    </div>
  );
}
