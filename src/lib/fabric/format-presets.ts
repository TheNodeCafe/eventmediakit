import type { TemplateFormat } from "@/types";

interface FormatPreset {
  label: string;
  width: number;
  height: number;
  ratio: string;
}

export const FORMAT_PRESETS: Record<TemplateFormat, FormatPreset> = {
  square_1x1: {
    label: "Carré (1:1)",
    width: 1080,
    height: 1080,
    ratio: "1:1",
  },
  story_9x16: {
    label: "Story (9:16)",
    width: 1080,
    height: 1920,
    ratio: "9:16",
  },
  landscape_16x9: {
    label: "Paysage (16:9)",
    width: 1920,
    height: 1080,
    ratio: "16:9",
  },
  linkedin_banner: {
    label: "Bannière LinkedIn",
    width: 1584,
    height: 396,
    ratio: "4:1",
  },
};
