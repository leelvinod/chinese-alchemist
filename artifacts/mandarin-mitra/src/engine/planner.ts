/* Mandarin Mitra — the session planner.
   The planner, not the learner, picks what a 3-minute session contains: one
   focus pattern, one drill at the learner's current ladder step, one spoken
   sentence on the same pattern, then up to 8 due reviews. */

import { PATTERNS } from '../content/patterns';
import type { DrillItem, Pattern } from '../content/types';
import { drillAt } from './ladder';
import type { LadderState } from './ladder';
import type { ErrorCode } from './errors';

export interface PlannerInput {
  hsk: number;
  ladders: Record<string, LadderState>;
  /** Error counts, most recent window. The planner favours patterns that target
   *  the learner's live errors. */
  errorCounts: Partial<Record<ErrorCode, number>>;
  /** Patterns already used today, so the focus rotates. */
  recentPatternIds: readonly string[];
}

export interface SessionPlan {
  pattern: Pattern;
  /** The drill at the learner's current step. */
  drill: DrillItem;
  /** One spoken sentence on the same pattern. */
  spoken: DrillItem | null;
  reviewCap: number;
}

/** Patterns the learner can see: at or below their level. */
export function availablePatterns(hsk: number): Pattern[] {
  return PATTERNS.filter((p) => p.hsk <= Math.max(1, hsk));
}

/** How badly this pattern is needed: its targeted errors, weighted, minus a
 *  penalty for having just been practised, minus its mastery. */
function patternScore(p: Pattern, input: PlannerInput): number {
  const errs = p.targets.reduce((sum, code) => sum + (input.errorCounts[code] ?? 0), 0);
  const ladder = input.ladders[p.id];
  const mastery = ladder?.mastery ?? 0;
  const recent = input.recentPatternIds.includes(p.id) ? 4 : 0;
  // An untouched pattern is worth practising; a Stable one is nearly done.
  const freshness = ladder ? 0 : 2;
  return errs * 3 + freshness - mastery * 1.5 - recent;
}

export function pickFocusPattern(input: PlannerInput): Pattern {
  const pool = availablePatterns(input.hsk);
  const first = pool[0] ?? PATTERNS[0];
  if (!first) throw new Error('No patterns loaded');
  return pool.reduce((best, p) => (patternScore(p, input) > patternScore(best, input) ? p : best), first);
}

/** The drill for a pattern at a given ladder step, falling back down the ladder
 *  when the content team has not written that step for this pattern yet. */
export function pickDrill(pattern: Pattern, step: number): DrillItem {
  for (let s = step; s >= 0; s--) {
    const kind = drillAt(s);
    const hit = pattern.drills.find((d) => d.kind === kind);
    if (hit) return hit;
  }
  const first = pattern.drills[0];
  if (!first) throw new Error(`Pattern ${pattern.id} has no drills`);
  return first;
}

export function planSession(input: PlannerInput, reviewCap = 8): SessionPlan {
  const pattern = pickFocusPattern(input);
  const ladder = input.ladders[pattern.id];
  const drill = pickDrill(pattern, ladder?.step ?? 0);
  const spoken = pattern.drills.find((d) => d.kind === 'sayit') ?? null;
  return { pattern, drill, spoken, reviewCap };
}
