"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  STARTER_TEMPLATES,
  STARTER_CATEGORIES,
  type StarterTemplate,
} from "@/lib/templates/starter-templates";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat } from "@/types";
import { LayoutTemplate, Sparkles } from "lucide-react";

interface StarterTemplatesDialogProps {
  open: boolean;
  onSelect: (template: StarterTemplate | null) => void;
}

export function StarterTemplatesDialog({
  open,
  onSelect,
}: StarterTemplatesDialogProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<StarterTemplate | null>(null);

  const filtered = activeCategory
    ? STARTER_TEMPLATES.filter((t) => t.category === activeCategory)
    : STARTER_TEMPLATES;

  function handleConfirm() {
    onSelect(selected);
  }

  function handleBlank() {
    onSelect(null);
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-3xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choisir un modele de depart
          </DialogTitle>
          <DialogDescription>
            Commencez avec un template pre-concu ou un canvas vierge
          </DialogDescription>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
              activeCategory === null
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-black/[0.04]"
            }`}
          >
            Tous
          </button>
          {STARTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-black/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[400px] overflow-y-auto py-1">
          {/* Blank canvas option */}
          <button
            onClick={() => setSelected(null)}
            className={`group flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
              selected === null
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-dashed border-border/60 hover:border-border"
            }`}
          >
            <div className="mb-3 flex h-24 w-full items-center justify-center rounded-lg bg-muted/30">
              <LayoutTemplate className="h-10 w-10 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50" />
            </div>
            <span className="text-[13px] font-semibold">Canvas vierge</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              Commencer de zero
            </span>
          </button>

          {/* Starter templates */}
          {filtered.map((t) => {
            const isSelected = selected?.id === t.id;
            const preset = FORMAT_PRESETS[t.format as TemplateFormat];
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`group flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/40 bg-white hover:border-border"
                }`}
              >
                {/* Color preview */}
                <div
                  className="mb-3 flex h-24 w-full items-center justify-center rounded-lg overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1 opacity-80">
                    {/* Mini layout preview */}
                    <div className="h-6 w-6 rounded-full bg-white/30" />
                    <div className="h-1.5 w-14 rounded-full bg-white/50" />
                    <div className="h-1 w-10 rounded-full bg-white/30" />
                  </div>
                </div>
                <span className="text-[13px] font-semibold">{t.name}</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {t.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {preset?.ratio ?? `${t.width}x${t.height}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleBlank}>
            Canvas vierge
          </Button>
          <Button onClick={handleConfirm}>
            {selected ? "Utiliser ce modele" : "Canvas vierge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
