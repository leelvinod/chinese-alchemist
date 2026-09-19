/* Mandarin Mitra — ladder movement (§7).
   Three first-try successes move the learner up a step. Two consecutive failures
   move them down one, silently — the next drill is just easier, with no message. */

import { DRILL_ORDER } from '../content/types';
import type { DrillKind } from '../content/types';

/** 0 Introduced · 1 Recognised · 2 Scaffolded · 3 Free · 4 Stable */
export const MASTERY_MAX = 4;

export interface LadderState {
  /** Index into DRILL_ORDER: which drill kind the learner is on. */
  step: number;
  /** First-try successes since the last promotion. */
  streak: number;
  /** Consecutive failures since the last success. */
  misses: number;
  /** Mastery state shown as a chip, 0–4. */
  mastery: number;
}

export const initialLadder = (): LadderState => ({ step: 0, streak: 0, misses: 0, mastery: 0 });

export interface LadderMove {
  next: LadderState;
  /** 'up' shows a subtle toast; 'down' shows nothing at all. */
  moved: 'up' | 'down' | null;
}

export function advance(state: LadderState, firstTryPass: boolean): LadderMove {
  const maxStep = DRILL_ORDER.length - 1;

  if (firstTryPass) {
    const streak = state.streak + 1;
    if (streak >= 3 && state.step < maxStep) {
      return {
        next: {
          step: state.step + 1,
          streak: 0,
          misses: 0,
          mastery: Math.min(MASTERY_MAX, state.mastery + 1),
        },
        moved: 'up',
      };
    }
    // At the top of the ladder, three more first-try passes still earn Stable.
    if (streak >= 3 && state.step === maxStep && state.mastery < MASTERY_MAX) {
      return { next: { ...state, streak: 0, misses: 0, mastery: state.mastery + 1 }, moved: 'up' };
    }
    return { next: { ...state, streak, misses: 0 }, moved: null };
  }

  const misses = state.misses + 1;
  if (misses >= 2 && state.step > 0) {
    return { next: { step: state.step - 1, streak: 0, misses: 0, mastery: state.mastery }, moved: 'down' };
  }
  return { next: { ...state, streak: 0, misses }, moved: null };
}

export const drillAt = (step: number): DrillKind =>
  DRILL_ORDER[Math.max(0, Math.min(DRILL_ORDER.length - 1, step))] ?? 'reorder';

/** Which ladder steps the learner may pick in Practice. */
export const unlockedSteps = (state: LadderState): number[] =>
  Array.from({ length: state.step + 1 }, (_, i) => i);
