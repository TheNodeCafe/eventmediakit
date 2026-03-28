/**
 * Curated list of ~40 popular Google Fonts with category metadata.
 * Provides helpers to dynamically load font CSS via the Google Fonts CDN.
 */

export type FontCategory = "sans-serif" | "serif" | "display" | "handwriting" | "monospace";

export interface GoogleFont {
  name: string;
  category: FontCategory;
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // Sans-serif
  { name: "Inter", category: "sans-serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Poppins", category: "sans-serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Nunito", category: "sans-serif" },
  { name: "Ubuntu", category: "sans-serif" },
  { name: "Rubik", category: "sans-serif" },
  { name: "Work Sans", category: "sans-serif" },
  { name: "Fira Sans", category: "sans-serif" },
  { name: "DM Sans", category: "sans-serif" },
  { name: "Space Grotesk", category: "sans-serif" },
  { name: "Plus Jakarta Sans", category: "sans-serif" },
  { name: "Outfit", category: "sans-serif" },
  { name: "Sora", category: "sans-serif" },
  { name: "Barlow", category: "sans-serif" },
  { name: "Josefin Sans", category: "sans-serif" },
  { name: "Cabin", category: "sans-serif" },
  { name: "Karla", category: "sans-serif" },
  { name: "Mulish", category: "sans-serif" },
  { name: "Manrope", category: "sans-serif" },
  { name: "Noto Sans", category: "sans-serif" },
  { name: "Quicksand", category: "sans-serif" },
  { name: "Comfortaa", category: "sans-serif" },
  { name: "Exo 2", category: "sans-serif" },

  // Serif
  { name: "Playfair Display", category: "serif" },
  { name: "Merriweather", category: "serif" },

  // Display
  { name: "Oswald", category: "display" },
  { name: "Bebas Neue", category: "display" },
  { name: "Anton", category: "display" },
  { name: "Archivo Black", category: "display" },
  { name: "Righteous", category: "display" },
  { name: "Fredoka One", category: "display" },

  // Handwriting
  { name: "Pacifico", category: "handwriting" },
  { name: "Lobster", category: "handwriting" },
  { name: "Dancing Script", category: "handwriting" },
  { name: "Caveat", category: "handwriting" },
  { name: "Permanent Marker", category: "handwriting" },
];

/** Set of fonts already injected into the document head. */
const loadedFonts = new Set<string>();

/**
 * Inject a Google Fonts `<link>` for the given font name.
 * No-op if already loaded or running on the server.
 */
export function loadGoogleFont(fontName: string): void {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);

  const encoded = fontName.replace(/ /g, "+");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Load multiple Google Fonts at once.
 */
export function loadMultipleFonts(fontNames: string[]): void {
  fontNames.forEach(loadGoogleFont);
}

/**
 * Scan a Fabric.js canvas JSON for all fontFamily values and return them.
 */
export function extractFontsFromCanvasJson(canvasJson: Record<string, unknown>): string[] {
  const fonts = new Set<string>();
  const objects = (canvasJson as { objects?: Record<string, unknown>[] }).objects;
  if (!Array.isArray(objects)) return [];

  for (const obj of objects) {
    if (typeof obj.fontFamily === "string" && obj.fontFamily) {
      fonts.add(obj.fontFamily);
    }
  }
  return Array.from(fonts);
}

/**
 * Group fonts by category for display.
 */
export function getFontsByCategory(): Record<FontCategory, GoogleFont[]> {
  const grouped: Record<FontCategory, GoogleFont[]> = {
    "sans-serif": [],
    "serif": [],
    "display": [],
    "handwriting": [],
    "monospace": [],
  };
  for (const font of GOOGLE_FONTS) {
    grouped[font.category].push(font);
  }
  return grouped;
}

const CATEGORY_LABELS: Record<FontCategory, string> = {
  "sans-serif": "Sans-Serif",
  "serif": "Serif",
  "display": "Display",
  "handwriting": "Manuscrites",
  "monospace": "Monospace",
};

export { CATEGORY_LABELS };
