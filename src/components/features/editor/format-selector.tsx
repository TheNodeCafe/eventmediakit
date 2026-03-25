"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store/editor-store";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat } from "@/types";

export function FormatSelector() {
  const { format, setFormat } = useEditorStore();

  function handleChange(value: string | null) {
    if (!value) return;
    const fmt = value as TemplateFormat;
    const preset = FORMAT_PRESETS[fmt];
    setFormat(fmt, preset.width, preset.height);
  }

  return (
    <Select value={format} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(FORMAT_PRESETS).map(([key, preset]) => (
          <SelectItem key={key} value={key}>
            {preset.label} ({preset.width}x{preset.height})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
