import { describe, expect, it } from 'vitest';
import { availablePatterns, pickDrill, pickFocusPattern, planSession } from './planner';
import type { PlannerInput } from './planner';
import { PATTERNS, PATTERN_BY_ID } from '../content/patterns';
import { initialLadder } from './ladder';

const base: PlannerInput = { hsk: 4, ladders: {}, errorCounts: {}, recentPatternIds: [] };

describe('availablePatterns', () => {
  it('never shows a pattern above the learner level', () => {
    expect(availablePatterns(1).every((p) => p.hsk === 1)).toBe(true);
    expect(availablePatterns(2).some((p) => p.hsk === 2)).toBe(true);
    expect(availablePatterns(2).some((p) => p.hsk === 3)).toBe(false);
  });

  it('treats HSK 0 as HSK 1 — there is no pre-HSK 1 path', () => {
    expect(availablePatterns(0).length).toBeGreaterThan(0);
  });
});

describe('pickFocusPattern', () => {
  it('favours the pattern that targets the learner live errors', () => {
    const p = pickFocusPattern({
      ...base,
      errorCounts: { 'COPULA.shi_before_adjective': 9 },
    });
    expect(p.id).toBe('hen-adjective');
  });

  it('rotates away from what was just practised', () => {
    const first = pickFocusPattern(base);
    const second = pickFocusPattern({ ...base, recentPatternIds: [first.id] });
    expect(second.id).not.toBe(first.id);
  });

  it('prefers an untouched pattern over a Stable one', () => {
    const stable = PATTERNS[0];
    const p = pickFocusPattern({
      ...base,
      ladders: { [stable!.id]: { ...initialLadder(), mastery: 4 } },
    });
    expect(p.id).not.toBe(stable!.id);
  });

  it('always returns a pattern the learner can actually reach', () => {
    const p = pickFocusPattern({ ...base, hsk: 1 });
    expect(p.hsk).toBe(1);
  });
});

describe('pickDrill', () => {
  it('returns the drill for the requested ladder step', () => {
    const p = PATTERN_BY_ID['time-before-verb']!;
    expect(pickDrill(p, 0).kind).toBe('reorder');
    expect(pickDrill(p, 3).kind).toBe('translate');
  });

  it('falls back down the ladder when a step has no drill written yet', () => {
    // measure-words has no reorder drill; step 0 must still yield something.
    const p = PATTERN_BY_ID['measure-words']!;
    expect(pickDrill(p, 0)).toBeDefined();
  });

  it('never returns a drill from a different pattern', () => {
    for (const p of PATTERNS) {
      for (let step = 0; step < 6; step++) {
        expect(p.drills).toContain(pickDrill(p, step));
      }
    }
  });
});

describe('planSession', () => {
  it('pairs one drill with a spoken sentence on the same pattern', () => {
    const plan = planSession(base);
    expect(plan.drill.target).toBeDefined();
    if (plan.spoken) expect(plan.pattern.drills).toContain(plan.spoken);
  });

  it('carries the review cap through', () => {
    expect(planSession(base, 14).reviewCap).toBe(14);
  });

  it('defaults to eight reviews — the 3-minute session budget', () => {
    expect(planSession(base).reviewCap).toBe(8);
  });
});

describe('coverage across the level range', () => {
  it('reaches HSK 4 patterns for a learner placed there', () => {
    expect(availablePatterns(4).some((p) => p.hsk === 4)).toBe(true);
  });

  it('offers more than one pattern at every level, so the focus can rotate', () => {
    for (const lv of [1, 2, 3, 4]) {
      expect(PATTERNS.filter((p) => p.hsk === lv).length, `HSK ${lv}`).toBeGreaterThan(1);
    }
  });

  it('gives an HSK 1 learner a full ladder to climb without leaving their level', () => {
    const kinds = new Set(availablePatterns(1).flatMap((p) => p.drills.map((d) => d.kind)));
    for (const k of ['reorder', 'fill', 'transform', 'translate', 'sayit']) {
      expect(kinds.has(k as never), k).toBe(true);
    }
  });
});
