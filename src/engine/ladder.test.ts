import { describe, expect, it } from 'vitest';
import { advance, drillAt, initialLadder, unlockedSteps } from './ladder';
import type { LadderState } from './ladder';

const run = (start: LadderState, passes: boolean[]): LadderState =>
  passes.reduce((s, p) => advance(s, p).next, start);

describe('advance — promotion', () => {
  it('moves up after three first-try successes', () => {
    const s = run(initialLadder(), [true, true, true]);
    expect(s.step).toBe(1);
    expect(s.mastery).toBe(1);
  });

  it('does not move up on two', () => {
    const s = run(initialLadder(), [true, true]);
    expect(s.step).toBe(0);
    expect(s.streak).toBe(2);
  });

  it('reports the promotion so the toast can be shown', () => {
    const two = run(initialLadder(), [true, true]);
    expect(advance(two, true).moved).toBe('up');
  });

  it('resets the streak after promoting, so each step is earned separately', () => {
    const s = run(initialLadder(), [true, true, true]);
    expect(s.streak).toBe(0);
  });

  it('earns Stable at the top of the ladder without stepping past it', () => {
    let s: LadderState = { step: 5, streak: 0, misses: 0, mastery: 3 };
    s = run(s, [true, true, true]);
    expect(s.step).toBe(5);
    expect(s.mastery).toBe(4);
  });

  it('caps mastery at Stable', () => {
    let s: LadderState = { step: 5, streak: 0, misses: 0, mastery: 4 };
    s = run(s, [true, true, true, true, true, true]);
    expect(s.mastery).toBe(4);
  });
});

describe('advance — demotion', () => {
  it('moves down after two consecutive failures', () => {
    const s = run({ step: 2, streak: 0, misses: 0, mastery: 2 }, [false, false]);
    expect(s.step).toBe(1);
  });

  it('says nothing when it moves down — the next drill is just easier', () => {
    const one = advance({ step: 2, streak: 0, misses: 0, mastery: 2 }, false);
    expect(one.moved).toBeNull();
    expect(advance(one.next, false).moved).toBe('down');
  });

  it('keeps mastery when stepping down, so the chip does not lurch backwards', () => {
    const s = run({ step: 2, streak: 0, misses: 0, mastery: 2 }, [false, false]);
    expect(s.mastery).toBe(2);
  });

  it('never goes below the first step', () => {
    const s = run(initialLadder(), [false, false, false, false]);
    expect(s.step).toBe(0);
  });

  it('a success between two failures clears the miss counter', () => {
    const s = run({ step: 2, streak: 0, misses: 0, mastery: 2 }, [false, true, false]);
    expect(s.step).toBe(2);
  });
});

describe('drillAt', () => {
  it('walks the six-step ladder in order', () => {
    expect([0, 1, 2, 3, 4, 5].map(drillAt)).toEqual([
      'reorder',
      'fill',
      'transform',
      'translate',
      'build',
      'sayit',
    ]);
  });

  it('clamps out-of-range steps rather than returning undefined', () => {
    expect(drillAt(99)).toBe('sayit');
    expect(drillAt(-3)).toBe('reorder');
  });
});

describe('unlockedSteps', () => {
  it('unlocks everything up to and including the current step', () => {
    expect(unlockedSteps({ step: 3, streak: 0, misses: 0, mastery: 2 })).toEqual([0, 1, 2, 3]);
  });
});
