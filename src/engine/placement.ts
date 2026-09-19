/* Mandarin Mitra — placement (ON-08).
   Adaptive: start at HSK 2, step up on a run of right answers and down on a run
   of wrong ones. 15–20 items, no visible count, no "wrong" states. The result is
   a level plus the strongest and weakest area — never a score. */

import { PLACEMENT_ITEMS } from '../content/placement';
import type { HskLevel, PlacementItem } from '../content/types';

export interface PlacementState {
  level: HskLevel;
  asked: string[];
  /** Right/wrong per item, in order. */
  results: { id: string; hsk: HskLevel; kind: PlacementItem['kind']; right: boolean }[];
  /** Consecutive right / wrong at the current level. */
  run: number;
  done: boolean;
}

export const MIN_ITEMS = 15;
export const MAX_ITEMS = 20;

export const initialPlacement = (): PlacementState => ({
  level: 2,
  asked: [],
  results: [],
  run: 0,
  done: false,
});

const clampLevel = (n: number): HskLevel => (Math.max(1, Math.min(4, n)) as HskLevel);

/** The next item, or null when the test is over. Speaking items are skipped when
 *  the mic is unavailable; the result then notes "speaking not tested". */
export function nextItem(state: PlacementState, micAllowed: boolean): PlacementItem | null {
  if (state.done || state.results.length >= MAX_ITEMS) return null;
  for (const level of [state.level, clampLevel(state.level - 1), clampLevel(state.level + 1), 1, 2, 3, 4]) {
    const hit = PLACEMENT_ITEMS.find(
      (i) => i.hsk === level && !state.asked.includes(i.id) && (micAllowed || i.kind !== 'spoken'),
    );
    if (hit) return hit;
  }
  return null;
}

export function record(state: PlacementState, item: PlacementItem, right: boolean): PlacementState {
  const results = [...state.results, { id: item.id, hsk: item.hsk, kind: item.kind, right }];

  // run counts consecutive answers in one direction: positive right, negative wrong.
  const run = right ? Math.max(0, state.run) + 1 : Math.min(0, state.run) - 1;

  const level = run >= 2 ? clampLevel(state.level + 1) : run <= -2 ? clampLevel(state.level - 1) : state.level;

  return {
    level,
    asked: [...state.asked, item.id],
    results,
    // A level change resets the run, so the next move needs two fresh answers.
    run: level === state.level ? run : 0,
    done: results.length >= MAX_ITEMS,
  };
}

export interface PlacementResult {
  level: HskLevel;
  /** Plain-English name of the strongest area. */
  strongest: string;
  weakest: string;
  speakingTested: boolean;
}

const KIND_NAME: Record<PlacementItem['kind'], string> = {
  meaning: 'Vocabulary',
  listen: 'Listening',
  reorder: 'Word order',
  spoken: 'Speaking',
};

/** The level is the highest band the learner answered more right than wrong in. */
export function score(state: PlacementState): PlacementResult {
  const byLevel = new Map<HskLevel, { right: number; total: number }>();
  const byKind = new Map<PlacementItem['kind'], { right: number; total: number }>();
  for (const r of state.results) {
    const l = byLevel.get(r.hsk) ?? { right: 0, total: 0 };
    byLevel.set(r.hsk, { right: l.right + (r.right ? 1 : 0), total: l.total + 1 });
    const k = byKind.get(r.kind) ?? { right: 0, total: 0 };
    byKind.set(r.kind, { right: k.right + (r.right ? 1 : 0), total: k.total + 1 });
  }

  let level: HskLevel = 1;
  for (const l of [1, 2, 3, 4] as HskLevel[]) {
    const b = byLevel.get(l);
    if (b && b.total > 0 && b.right / b.total >= 0.6) level = l;
  }

  const rates = [...byKind.entries()]
    .filter(([, v]) => v.total > 0)
    .map(([k, v]) => ({ kind: k, rate: v.right / v.total }))
    .sort((a, b) => b.rate - a.rate);

  const best = rates[0];
  const worst = rates[rates.length - 1];
  return {
    level,
    strongest: best ? KIND_NAME[best.kind] : 'Vocabulary',
    weakest: worst ? KIND_NAME[worst.kind] : 'Word order',
    speakingTested: state.results.some((r) => r.kind === 'spoken'),
  };
}
