/**
 * Pre-built starter templates for the template editor.
 * Each template contains a Fabric.js-compatible canvas JSON with
 * decorative elements and variable field placeholders.
 */

import type { TemplateFormat } from "@/types";

export interface StarterTemplate {
  id: string;
  name: string;
  category: string;
  format: TemplateFormat;
  width: number;
  height: number;
  thumbnailDescription: string;
  /** Accent colors used for the thumbnail card preview */
  colors: [string, string];
  canvas_json: Record<string, unknown>;
}

let objectIdCounter = 0;
function nextId() {
  return `starter_${++objectIdCounter}`;
}

/**
 * Helper to create a Fabric.js text object with variable field binding.
 */
function textObject(opts: {
  text: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight?: string;
  textAlign?: string;
  variableField?: string;
  lineHeight?: number;
  charSpacing?: number;
}): Record<string, unknown> {
  return {
    type: "textbox",
    version: "6.0.0",
    left: opts.left,
    top: opts.top,
    width: opts.width,
    height: opts.fontSize * 1.4,
    text: opts.text,
    fontSize: opts.fontSize,
    fontFamily: opts.fontFamily,
    fontWeight: opts.fontWeight ?? "normal",
    fill: opts.fill,
    textAlign: opts.textAlign ?? "center",
    lineHeight: opts.lineHeight ?? 1.2,
    charSpacing: opts.charSpacing ?? 0,
    id: nextId(),
    variableField: opts.variableField ?? "",
    originX: "left",
    originY: "top",
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    stroke: null,
    strokeWidth: 0,
    visible: true,
  };
}

/**
 * Helper to create a Fabric.js rectangle.
 */
function rectObject(opts: {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: unknown;
  rx?: number;
  ry?: number;
  opacity?: number;
  variableField?: string;
}): Record<string, unknown> {
  return {
    type: "rect",
    version: "6.0.0",
    left: opts.left,
    top: opts.top,
    width: opts.width,
    height: opts.height,
    fill: opts.fill,
    rx: opts.rx ?? 0,
    ry: opts.ry ?? 0,
    id: nextId(),
    variableField: opts.variableField ?? "",
    originX: "left",
    originY: "top",
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: opts.opacity ?? 1,
    stroke: null,
    strokeWidth: 0,
    visible: true,
  };
}

/**
 * Helper for a circle shape.
 */
function circleObject(opts: {
  left: number;
  top: number;
  radius: number;
  fill: unknown;
  opacity?: number;
  variableField?: string;
}): Record<string, unknown> {
  return {
    type: "circle",
    version: "6.0.0",
    left: opts.left,
    top: opts.top,
    radius: opts.radius,
    width: opts.radius * 2,
    height: opts.radius * 2,
    fill: opts.fill,
    id: nextId(),
    variableField: opts.variableField ?? "",
    originX: "left",
    originY: "top",
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: opts.opacity ?? 1,
    stroke: null,
    strokeWidth: 0,
    visible: true,
  };
}

function linearGradient(
  x1: number, y1: number, x2: number, y2: number,
  color1: string, color2: string
) {
  return {
    type: "linear",
    coords: { x1, y1, x2, y2 },
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 },
    ],
    offsetX: 0,
    offsetY: 0,
  };
}

// ─── Template 1: Conference Speaker (1080x1080) ──────────────────────────────

const conferenceSpeaker: StarterTemplate = {
  id: "starter-conference-speaker",
  name: "Conference Speaker",
  category: "Conference",
  format: "square_1x1",
  width: 1080,
  height: 1080,
  thumbnailDescription: "Gradient background, circular photo, speaker name and title",
  colors: ["#6366f1", "#a855f7"],
  canvas_json: {
    version: "6.0.0",
    objects: [
      // Background gradient
      rectObject({
        left: 0, top: 0, width: 1080, height: 1080,
        fill: linearGradient(0, 0, 1080, 1080, "#1e1b4b", "#312e81"),
      }),
      // Decorative circle top-right
      circleObject({
        left: 800, top: -120, radius: 300,
        fill: "#6366f1", opacity: 0.15,
      }),
      // Decorative circle bottom-left
      circleObject({
        left: -100, top: 780, radius: 250,
        fill: "#a855f7", opacity: 0.12,
      }),
      // Accent bar top
      rectObject({
        left: 0, top: 0, width: 1080, height: 6,
        fill: linearGradient(0, 0, 1080, 0, "#6366f1", "#a855f7"),
      }),
      // Photo placeholder circle
      circleObject({
        left: 340, top: 180, radius: 200,
        fill: "#4338ca",
        variableField: "photo",
      }),
      // Speaker name
      textObject({
        text: "{{Prenom}} {{Nom}}",
        left: 140, top: 630, width: 800,
        fontSize: 64, fontFamily: "Montserrat", fill: "#ffffff",
        fontWeight: "bold", variableField: "prenom",
      }),
      // Job title
      textObject({
        text: "{{Poste}}",
        left: 140, top: 720, width: 800,
        fontSize: 36, fontFamily: "Inter", fill: "#c4b5fd",
        variableField: "poste",
      }),
      // Company
      textObject({
        text: "{{Entreprise}}",
        left: 140, top: 780, width: 800,
        fontSize: 32, fontFamily: "Inter", fill: "#a78bfa",
        variableField: "entreprise",
      }),
      // Event branding area — bottom bar
      rectObject({
        left: 0, top: 1000, width: 1080, height: 80,
        fill: "#0f0a2e", opacity: 0.6,
      }),
      // "SPEAKER" badge
      rectObject({
        left: 40, top: 140, width: 180, height: 36,
        fill: "#6366f1", rx: 18, ry: 18,
      }),
      textObject({
        text: "SPEAKER",
        left: 40, top: 145, width: 180,
        fontSize: 18, fontFamily: "Inter", fill: "#ffffff",
        fontWeight: "bold", charSpacing: 200,
      }),
    ],
  },
};

// ─── Template 2: Conference Speaker Story (1080x1920) ─────────────────────────

const conferenceSpeakerStory: StarterTemplate = {
  id: "starter-conference-story",
  name: "Conference Speaker Story",
  category: "Conference",
  format: "story_9x16",
  width: 1080,
  height: 1920,
  thumbnailDescription: "Vertical story with speaker photo, name and title",
  colors: ["#0f172a", "#6366f1"],
  canvas_json: {
    version: "6.0.0",
    objects: [
      // Background
      rectObject({
        left: 0, top: 0, width: 1080, height: 1920,
        fill: linearGradient(0, 0, 540, 1920, "#0f172a", "#1e1b4b"),
      }),
      // Decorative large circle
      circleObject({
        left: 600, top: -200, radius: 500,
        fill: "#6366f1", opacity: 0.08,
      }),
      // Accent line left
      rectObject({
        left: 60, top: 300, width: 4, height: 200,
        fill: linearGradient(0, 0, 0, 200, "#6366f1", "#a855f7"),
      }),
      // Photo placeholder
      circleObject({
        left: 290, top: 500, radius: 250,
        fill: "#312e81",
        variableField: "photo",
      }),
      // Name
      textObject({
        text: "{{Prenom}}",
        left: 80, top: 1060, width: 920,
        fontSize: 72, fontFamily: "Bebas Neue", fill: "#ffffff",
        fontWeight: "bold", variableField: "prenom",
      }),
      // Last name
      textObject({
        text: "{{Nom}}",
        left: 80, top: 1150, width: 920,
        fontSize: 72, fontFamily: "Bebas Neue", fill: "#c4b5fd",
        fontWeight: "bold", variableField: "nom",
      }),
      // Title
      textObject({
        text: "{{Poste}}",
        left: 80, top: 1280, width: 920,
        fontSize: 36, fontFamily: "Inter", fill: "#a78bfa",
        variableField: "poste",
      }),
      // Company
      textObject({
        text: "{{Entreprise}}",
        left: 80, top: 1340, width: 920,
        fontSize: 30, fontFamily: "Inter", fill: "#818cf8",
        variableField: "entreprise",
      }),
      // Bottom gradient bar
      rectObject({
        left: 0, top: 1840, width: 1080, height: 80,
        fill: linearGradient(0, 0, 1080, 0, "#6366f1", "#a855f7"),
      }),
      // "SPEAKER" badge top
      rectObject({
        left: 60, top: 200, width: 200, height: 42,
        fill: "#6366f1", rx: 21, ry: 21,
      }),
      textObject({
        text: "SPEAKER",
        left: 60, top: 207, width: 200,
        fontSize: 20, fontFamily: "Inter", fill: "#ffffff",
        fontWeight: "bold", charSpacing: 250,
      }),
    ],
  },
};

// ─── Template 3: Exhibition Stand (1080x1080) ─────────────────────────────────

const exhibitionStand: StarterTemplate = {
  id: "starter-exhibition-stand",
  name: "Exhibition Stand",
  category: "Salon",
  format: "square_1x1",
  width: 1080,
  height: 1080,
  thumbnailDescription: "Bold dark background with company logo area and stand number",
  colors: ["#f59e0b", "#1e1b4b"],
  canvas_json: {
    version: "6.0.0",
    objects: [
      // Background
      rectObject({
        left: 0, top: 0, width: 1080, height: 1080,
        fill: "#0f172a",
      }),
      // Yellow accent strip top
      rectObject({
        left: 0, top: 0, width: 1080, height: 8,
        fill: "#f59e0b",
      }),
      // Yellow accent strip left
      rectObject({
        left: 0, top: 0, width: 8, height: 1080,
        fill: "#f59e0b",
      }),
      // Company logo area (rect placeholder)
      rectObject({
        left: 340, top: 120, width: 400, height: 200,
        fill: "#1e293b", rx: 20, ry: 20,
        variableField: "photo",
      }),
      // Stand number large
      textObject({
        text: "STAND",
        left: 140, top: 420, width: 800,
        fontSize: 28, fontFamily: "Inter", fill: "#f59e0b",
        fontWeight: "bold", charSpacing: 400,
      }),
      textObject({
        text: "{{N Stand}}",
        left: 140, top: 460, width: 800,
        fontSize: 120, fontFamily: "Bebas Neue", fill: "#ffffff",
        fontWeight: "bold", variableField: "stand_number",
      }),
      // Divider
      rectObject({
        left: 390, top: 620, width: 300, height: 3,
        fill: "#f59e0b", opacity: 0.5,
      }),
      // Attendee name
      textObject({
        text: "{{Nom Complet}}",
        left: 140, top: 670, width: 800,
        fontSize: 48, fontFamily: "Montserrat", fill: "#ffffff",
        fontWeight: "bold", variableField: "prenom",
      }),
      // Company
      textObject({
        text: "{{Entreprise}}",
        left: 140, top: 750, width: 800,
        fontSize: 32, fontFamily: "Inter", fill: "#94a3b8",
        variableField: "entreprise",
      }),
      // Bottom bar
      rectObject({
        left: 0, top: 1020, width: 1080, height: 60,
        fill: "#f59e0b",
      }),
    ],
  },
};

// ─── Template 4: Minimalist Badge (1080x1350) ─────────────────────────────────

const minimalistBadge: StarterTemplate = {
  id: "starter-minimalist-badge",
  name: "Minimalist Badge",
  category: "Conference",
  format: "post_4x5",
  width: 1080,
  height: 1350,
  thumbnailDescription: "Clean white background with accent color bar, photo and name",
  colors: ["#ffffff", "#10b981"],
  canvas_json: {
    version: "6.0.0",
    objects: [
      // White background
      rectObject({
        left: 0, top: 0, width: 1080, height: 1350,
        fill: "#ffffff",
      }),
      // Accent bar left
      rectObject({
        left: 0, top: 0, width: 6, height: 1350,
        fill: "#10b981",
      }),
      // Photo placeholder
      circleObject({
        left: 365, top: 140, radius: 175,
        fill: "#f0fdf4",
        variableField: "photo",
      }),
      // Thin ring around photo
      circleObject({
        left: 357, top: 132, radius: 183,
        fill: "transparent", opacity: 1,
      }),
      // Name
      textObject({
        text: "{{Prenom}} {{Nom}}",
        left: 80, top: 560, width: 920,
        fontSize: 56, fontFamily: "DM Sans", fill: "#111827",
        fontWeight: "bold", variableField: "prenom",
      }),
      // Role
      textObject({
        text: "{{Poste}}",
        left: 80, top: 640, width: 920,
        fontSize: 32, fontFamily: "DM Sans", fill: "#10b981",
        variableField: "poste",
      }),
      // Company
      textObject({
        text: "{{Entreprise}}",
        left: 80, top: 700, width: 920,
        fontSize: 28, fontFamily: "DM Sans", fill: "#6b7280",
        variableField: "entreprise",
      }),
      // Subtle bottom line
      rectObject({
        left: 80, top: 1260, width: 920, height: 2,
        fill: "#e5e7eb",
      }),
      // Bottom accent dot
      circleObject({
        left: 520, top: 1290, radius: 8,
        fill: "#10b981",
      }),
    ],
  },
};

// ─── Template 5: Festival Artist (1080x1080) ──────────────────────────────────

const festivalArtist: StarterTemplate = {
  id: "starter-festival-artist",
  name: "Festival Artist",
  category: "Festival",
  format: "square_1x1",
  width: 1080,
  height: 1080,
  thumbnailDescription: "Vibrant gradient with artist photo circle and bold name",
  colors: ["#ec4899", "#f97316"],
  canvas_json: {
    version: "6.0.0",
    objects: [
      // Vibrant gradient background
      rectObject({
        left: 0, top: 0, width: 1080, height: 1080,
        fill: linearGradient(0, 0, 1080, 1080, "#7c2d92", "#be123c"),
      }),
      // Decorative circles
      circleObject({
        left: -150, top: -150, radius: 350,
        fill: "#ec4899", opacity: 0.15,
      }),
      circleObject({
        left: 700, top: 650, radius: 400,
        fill: "#f97316", opacity: 0.12,
      }),
      // Artist photo circle
      circleObject({
        left: 290, top: 100, radius: 250,
        fill: "#4a1d5e",
        variableField: "photo",
      }),
      // Photo ring
      circleObject({
        left: 280, top: 90, radius: 260,
        fill: "transparent", opacity: 0.5,
      }),
      // Artist name — big bold
      textObject({
        text: "{{Nom Artiste}}",
        left: 60, top: 660, width: 960,
        fontSize: 80, fontFamily: "Bebas Neue", fill: "#ffffff",
        fontWeight: "bold", variableField: "prenom",
      }),
      // Stage / date info
      textObject({
        text: "{{Scene}}",
        left: 60, top: 770, width: 960,
        fontSize: 36, fontFamily: "Poppins", fill: "#fecdd3",
        variableField: "poste",
      }),
      // Date
      textObject({
        text: "{{Date & Heure}}",
        left: 60, top: 830, width: 960,
        fontSize: 28, fontFamily: "Poppins", fill: "#fda4af",
        variableField: "entreprise",
      }),
      // Bottom gradient bar
      rectObject({
        left: 0, top: 1040, width: 1080, height: 40,
        fill: linearGradient(0, 0, 1080, 0, "#ec4899", "#f97316"),
      }),
    ],
  },
};

// ─── Template 6: Networking Card (1920x1080) ──────────────────────────────────

const networkingCard: StarterTemplate = {
  id: "starter-networking-card",
  name: "Networking Card",
  category: "Conference",
  format: "landscape_16x9",
  width: 1920,
  height: 1080,
  thumbnailDescription: "Professional landscape layout with photo, name, company and social handles",
  colors: ["#1e293b", "#3b82f6"],
  canvas_json: {
    version: "6.0.0",
    objects: [
      // Background
      rectObject({
        left: 0, top: 0, width: 1920, height: 1080,
        fill: "#f8fafc",
      }),
      // Left panel
      rectObject({
        left: 0, top: 0, width: 700, height: 1080,
        fill: linearGradient(0, 0, 0, 1080, "#1e293b", "#0f172a"),
      }),
      // Blue accent bar
      rectObject({
        left: 700, top: 0, width: 6, height: 1080,
        fill: "#3b82f6",
      }),
      // Photo circle on left panel
      circleObject({
        left: 175, top: 240, radius: 175,
        fill: "#334155",
        variableField: "photo",
      }),
      // Name on left
      textObject({
        text: "{{Prenom}}",
        left: 80, top: 660, width: 540,
        fontSize: 52, fontFamily: "Space Grotesk", fill: "#ffffff",
        fontWeight: "bold", variableField: "prenom",
      }),
      textObject({
        text: "{{Nom}}",
        left: 80, top: 730, width: 540,
        fontSize: 52, fontFamily: "Space Grotesk", fill: "#93c5fd",
        fontWeight: "bold", variableField: "nom",
      }),
      // Right side — details
      // Job title
      textObject({
        text: "{{Poste}}",
        left: 780, top: 300, width: 1060,
        fontSize: 48, fontFamily: "Inter", fill: "#1e293b",
        fontWeight: "bold", textAlign: "left",
        variableField: "poste",
      }),
      // Company
      textObject({
        text: "{{Entreprise}}",
        left: 780, top: 380, width: 1060,
        fontSize: 36, fontFamily: "Inter", fill: "#3b82f6",
        textAlign: "left",
        variableField: "entreprise",
      }),
      // Divider
      rectObject({
        left: 780, top: 460, width: 400, height: 2,
        fill: "#e2e8f0",
      }),
      // Social handles label
      textObject({
        text: "CONNECT WITH ME",
        left: 780, top: 500, width: 500,
        fontSize: 18, fontFamily: "Inter", fill: "#94a3b8",
        fontWeight: "bold", textAlign: "left",
        charSpacing: 300,
      }),
      // LinkedIn
      textObject({
        text: "{{LinkedIn}}",
        left: 780, top: 560, width: 1060,
        fontSize: 28, fontFamily: "Inter", fill: "#475569",
        textAlign: "left",
        variableField: "social_linkedin",
      }),
      // Bottom accent bar
      rectObject({
        left: 0, top: 1060, width: 1920, height: 20,
        fill: linearGradient(0, 0, 1920, 0, "#1e293b", "#3b82f6"),
      }),
    ],
  },
};

// ─── Export All ────────────────────────────────────────────────────────────────

export const STARTER_TEMPLATES: StarterTemplate[] = [
  conferenceSpeaker,
  conferenceSpeakerStory,
  exhibitionStand,
  minimalistBadge,
  festivalArtist,
  networkingCard,
];

export const STARTER_CATEGORIES = [
  ...new Set(STARTER_TEMPLATES.map((t) => t.category)),
];
