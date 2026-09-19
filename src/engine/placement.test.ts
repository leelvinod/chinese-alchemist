import { describe, expect, it } from 'vitest';
import { MAX_ITEMS, initialPlacement, nextItem, record, score } from './placement';
import type { PlacementState } from './placement';

/** Answer every served item the given way, until the bank runs dry. */
function runAll(right: (hsk: number) => boolean, micAllowed = true): PlacementState {
  let s = initialPlacement();
  for (let i = 0; i < MAX_ITEMS + 5; i++) {
    const item = nextItem(s, micAllowed);
    if (!item) break;
    s = record(s, item, right(item.hsk));
  }
  return s;
}

describe('nextItem', () => {
  it('starts in the middle of the range rather than at the bottom', () => {
    expect(nextItem(initialPlacement(), true)?.hsk).toBe(2);
  });

  it('never repeats an item', () => {
    const s = runAll(() => true);
    expect(new Set(s.asked).size).toBe(s.asked.length);
  });

  it('skips spoken items when the mic is off', () => {
    let s = initialPlacement();
    for (let i = 0; i < MAX_ITEMS; i++) {
      const item = nextItem(s, false);
      if (!item) break;
      expect(item.kind).not.toBe('spoken');
      s = record(s, item, true);
    }
  });

  it('stops once the maximum length is reached', () => {
    const s: PlacementState = { ...initialPlacement(), results: Array(MAX_ITEMS).fill({ id: 'x', hsk: 1, kind: 'meaning', right: true }) };
    expect(nextItem(s, true)).toBeNull();
  });
});

describe('record — adaptation', () => {
  it('steps up after two right in a row', () => {
    let s = initialPlacement();
    const a = nextItem(s, true)!;
    s = record(s, a, true);
    const b = nextItem(s, true)!;
    s = record(s, b, true);
    expect(s.level).toBe(3);
  });

  it('steps down after two wrong in a row', () => {
    let s = initialPlacement();
    s = record(s, nextItem(s, true)!, false);
    s = record(s, nextItem(s, true)!, false);
    expect(s.level).toBe(1);
  });

  it('does not move on one right answer', () => {
    let s = initialPlacement();
    s = record(s, nextItem(s, true)!, true);
    expect(s.level).toBe(2);
  });

  it('resets the run when the level changes, so the next move needs two fresh answers', () => {
    let s = initialPlacement();
    s = record(s, nextItem(s, true)!, true);
    s = record(s, nextItem(s, true)!, true);
    expect(s.level).toBe(3);
    expect(s.run).toBe(0);
  });

  it('a wrong answer cancels a run of right ones', () => {
    let s = initialPlacement();
    s = record(s, nextItem(s, true)!, true);
    s = record(s, nextItem(s, true)!, false);
    expect(s.run).toBe(-1);
    expect(s.level).toBe(2);
  });

  it('never leaves the HSK 1–4 band', () => {
    const low = runAll(() => false);
    expect(low.level).toBeGreaterThanOrEqual(1);
    const high = runAll(() => true);
    expect(high.level).toBeLessThanOrEqual(4);
  });
});

describe('score', () => {
  it('places a learner who gets everything right at the top of the range', () => {
    expect(score(runAll(() => true)).level).toBe(4);
  });

  it('places a learner who gets everything wrong at HSK 1, not below it', () => {
    expect(score(runAll(() => false)).level).toBe(1);
  });

  it('places a learner who handles HSK 1–2 but not above around HSK 2', () => {
    expect(score(runAll((hsk) => hsk <= 2)).level).toBe(2);
  });

  it('names a strongest and a weakest area', () => {
    const r = score(runAll((hsk) => hsk <= 2));
    expect(r.strongest).toBeTruthy();
    expect(r.weakest).toBeTruthy();
  });

  it('reports that speaking was not tested when the mic was off', () => {
    expect(score(runAll(() => true, false)).speakingTested).toBe(false);
  });

  it('reports that speaking was tested when the mic was on', () => {
    expect(score(runAll(() => true, true)).speakingTested).toBe(true);
  });
});
