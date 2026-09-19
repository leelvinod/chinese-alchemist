/* Mandarin Mitra — the slot colour system (deliverable 1).
   Eight sentence slots, one visual vocabulary. Colour never carries the meaning
   alone: each slot pairs a hue with a distinct underline weight and style, and
   an icon in skeletons and legends. Colours are derived from one OKLCH
   lightness step, so a theme change moves all eight together. */

export type SlotId =
  | 'subject'
  | 'time'
  | 'companion'
  | 'place'
  | 'manner'
  | 'verb'
  | 'complement'
  | 'object';

export type UnderlineStyle = 'solid' | 'double' | 'dashed' | 'dotted';

export interface SlotSpec {
  id: SlotId;
  label: string;
  hue: number;
  /** Underline style — the non-colour carrier of slot identity. */
  bs: UnderlineStyle;
  /** Underline weight in px. */
  bw: number;
  icon: string;
  mark: string;
}

export const MM_SLOTS: readonly SlotSpec[] = [
  { id: 'subject', label: 'Subject', hue: 20, bs: 'solid', bw: 2, icon: 'user', mark: 'S' },
  { id: 'time', label: 'Time', hue: 60, bs: 'double', bw: 3, icon: 'clock', mark: 'T' },
  { id: 'companion', label: 'Companion', hue: 110, bs: 'dashed', bw: 2, icon: 'users', mark: 'C' },
  { id: 'place', label: 'Place', hue: 155, bs: 'dotted', bw: 2.5, icon: 'pin', mark: 'P' },
  { id: 'manner', label: 'Manner', hue: 200, bs: 'dotted', bw: 1.5, icon: 'wave', mark: 'M' },
  { id: 'verb', label: 'Verb', hue: 300, bs: 'solid', bw: 4, icon: 'zap', mark: 'V' },
  { id: 'complement', label: 'Complement', hue: 345, bs: 'dashed', bw: 3.5, icon: 'arrow', mark: 'K' },
  { id: 'object', label: 'Object', hue: 250, bs: 'solid', bw: 2.5, icon: 'box', mark: 'O' },
] as const;

export const MM_SLOT: Record<SlotId, SlotSpec> = Object.fromEntries(
  MM_SLOTS.map((s) => [s.id, s]),
) as Record<SlotId, SlotSpec>;

export type ColourSim = 'deut' | 'prot' | 'grey';

/** Rendering preferences that every sentence primitive reads. */
export interface Ui {
  dark: boolean;
  /** Mono palette: no hue at all. Kept as an accessibility setting. */
  mono: boolean;
  hindi: 'deva' | 'roman' | 'off';
  pinyin: boolean;
  sim?: ColourSim;
}

const MM_MATRIX: Record<ColourSim, readonly number[]> = {
  deut: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  prot: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  grey: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

const simCache = new Map<string, string>();
let simCtx: CanvasRenderingContext2D | null = null;

/** Colour-vision simulation, done in JS so no CSS filter is needed. Used by the
 *  accessibility check in the foundations sheet; a no-op without `key`. */
export function mmSim(css: string, key?: ColourSim): string {
  if (!key) return css;
  const ck = `${key}|${css}`;
  const hit = simCache.get(ck);
  if (hit) return hit;
  if (typeof document === 'undefined') return css;
  if (!simCtx) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    simCtx = c.getContext('2d', { willReadFrequently: true });
  }
  if (!simCtx) return css;
  simCtx.clearRect(0, 0, 1, 1);
  simCtx.fillStyle = '#000';
  simCtx.fillStyle = css;
  simCtx.fillRect(0, 0, 1, 1);
  const px = simCtx.getImageData(0, 0, 1, 1).data;
  const r = px[0] ?? 0;
  const g = px[1] ?? 0;
  const b = px[2] ?? 0;
  const m = MM_MATRIX[key];
  const f = (i: number) =>
    Math.max(0, Math.min(255, Math.round((m[i] ?? 0) * r + (m[i + 1] ?? 0) * g + (m[i + 2] ?? 0) * b)));
  const out = `rgb(${f(0)},${f(3)},${f(6)})`;
  simCache.set(ck, out);
  return out;
}

/** The slot's ink. Verb is the anchor: one step darker, one step more chromatic. */
export function slotColor(id: SlotId, ui: Ui): string {
  const s = MM_SLOT[id];
  if (!s) return 'currentColor';
  if (ui.mono) {
    return mmSim(
      id === 'verb' ? (ui.dark ? '#dcae68' : '#7d5411') : ui.dark ? '#e7e3df' : '#201f1d',
      ui.sim,
    );
  }
  const L = ui.dark ? (id === 'verb' ? 0.87 : 0.8) : id === 'verb' ? 0.35 : 0.47;
  const C = id === 'verb' ? 0.125 : 0.11;
  return mmSim(`oklch(${L} ${C} ${s.hue})`, ui.sim);
}

/** The same colour at tile-fill strength. */
export function slotTint(id: SlotId, ui: Ui, pct?: number): string {
  const p = pct ?? (ui.dark ? 20 : 12);
  return `color-mix(in srgb, ${slotColor(id, ui)} ${p}%, transparent)`;
}

export const MM_THEME = {
  light: {
    '--mm-bg': '#f3f2f2',
    '--mm-surface': '#eae9e9',
    '--mm-ink': '#201f1d',
    '--mm-muted': 'rgba(32,31,29,.74)',
    '--mm-line': 'rgba(32,31,29,.16)',
    '--mm-accent': '#8a6222',
  },
  dark: {
    '--mm-bg': '#1b1a19',
    '--mm-surface': '#232120',
    '--mm-ink': '#ece8e3',
    '--mm-muted': 'rgba(236,232,227,.60)',
    '--mm-line': 'rgba(236,232,227,.18)',
    '--mm-accent': '#dcae68',
  },
} as const;

export const MM_ZH = "'Noto Sans SC','PingFang SC',sans-serif";
export const MM_PY = "'Noto Serif','Lora',serif";
export const MM_DV = "'Noto Sans Devanagari',sans-serif";

/** Feedback accents, theme-aware. Never a slot hue, and never red. */
export const fbCorrect = (ui: Ui) => (ui.dark ? '#8fba93' : '#4a7a52');
export const fbMinor = (ui: Ui) => (ui.dark ? '#e1ad66' : '#a06f24');
