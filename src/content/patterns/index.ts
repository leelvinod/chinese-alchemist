/* Mandarin Mitra — grammar patterns, HSK 1–4.
   Each pattern carries its rule, skeleton, worked examples, the Hindi transfer
   note, and the drills that climb its six-step ladder. The content team adds
   rows to the level files; nothing outside this folder has to change. */

import type { Pattern } from '../types';
import { HSK1 } from './hsk1';
import { HSK2 } from './hsk2';
import { HSK3 } from './hsk3';
import { HSK4 } from './hsk4';

export const PATTERNS: Pattern[] = [...HSK1, ...HSK2, ...HSK3, ...HSK4];

export const PATTERN_BY_ID: Record<string, Pattern> = Object.fromEntries(
  PATTERNS.map((p) => [p.id, p]),
);

/** Connector pairs the live guard watches for (§7 of the handoff). */
export const CONNECTOR_PAIRS: Record<string, { second: string; hindi: string; label: string }> = {
  虽然: { second: '但是', hindi: 'haalaanki … phir bhi', label: '…但是?' },
  如果: { second: '就', hindi: 'agar … to', label: '…就?' },
  因为: { second: '所以', hindi: 'kyunki … isliye', label: '…所以?' },
  不但: { second: '而且', hindi: 'na sirf … balki', label: '…而且?' },
  既然: { second: '就', hindi: 'jab … to', label: '…就?' },
};
