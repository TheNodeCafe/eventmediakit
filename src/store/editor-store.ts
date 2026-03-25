import { create } from "zustand";
import type { TemplateFormat } from "@/types";

interface EditorStore {
  // Canvas state
  selectedObjectId: string | null;
  isDirty: boolean;
  format: TemplateFormat;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;

  // Actions
  setSelectedObjectId: (id: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setFormat: (format: TemplateFormat, width: number, height: number) => void;
  setZoom: (zoom: number) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  selectedObjectId: null,
  isDirty: false,
  format: "square_1x1",
  canvasWidth: 1080,
  canvasHeight: 1080,
  zoom: 0.5,

  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setFormat: (format, canvasWidth, canvasHeight) =>
    set({ format, canvasWidth, canvasHeight }),
  setZoom: (zoom) => set({ zoom }),
}));
