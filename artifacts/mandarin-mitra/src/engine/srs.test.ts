import { describe, expect, it } from 'vitest';
import { MAX_INTERVAL_DAYS, dueCards, intervalLabel, isDue, newCard, nextInterval, review } from './srs';
import type { Card } from './srs';

const at = (iso: string) => new Date(iso);
const NOW = at('2026-09-19T10:00:00.000Z');

describe('newCard', () => {
  it('is due immediately, so a new word is met in the next session', () => {
    expect(isDue(newCard('v-mingtian', 'meaning', NOW), NOW)).toBe(true);
  });
});

describe('nextInterval', () => {
  it('sends Again back into the same session', () => {
    expect(nextInterval(newCard('w', 'meaning', NOW), 'again')).toBe(0);
  });

  it('gives a first-time card short, graded intervals', () => {
    const c = newCard('w', 'meaning', NOW);
    expect(nextInterval(c, 'hard')).toBe(1);
    expect(nextInterval(c, 'good')).toBe(2);
    expect(nextInterval(c, 'easy')).toBe(4);
  });

  it('grows with stability once a card is established', () => {
    const c: Card = { ...newCard('w', 'meaning', NOW), reps: 3, stability: 10 };
    expect(nextInterval(c, 'good')).toBeGreaterThan(10);
    expect(nextInterval(c, 'easy')).toBeGreaterThan(nextInterval(c, 'good'));
    expect(nextInterval(c, 'hard')).toBeLessThan(nextInterval(c, 'good'));
  });

  it('never returns a fractional day, since the buttons print the number', () => {
    const c: Card = { ...newCard('w', 'meaning', NOW), reps: 4, stability: 7, difficulty: 7 };
    for (const g of ['hard', 'good', 'easy'] as const) {
      expect(Number.isInteger(nextInterval(c, g))).toBe(true);
    }
  });
});

describe('intervalLabel', () => {
  it('reads the way the grade buttons need it to', () => {
    expect(intervalLabel(0)).toBe('10 min');
    expect(intervalLabel(1)).toBe('1 day');
    expect(intervalLabel(12)).toBe('12 days');
    expect(intervalLabel(30)).toBe('1 month');
    expect(intervalLabel(95)).toBe('3 months');
  });
});

describe('review', () => {
  it('schedules Again minutes away, not days', () => {
    const c = review(newCard('w', 'meaning', NOW), 'again', NOW);
    const gap = new Date(c.due).getTime() - NOW.getTime();
    expect(gap).toBe(10 * 60_000);
    expect(c.lapses).toBe(1);
  });

  it('counts the repetition and pushes the due date out on Good', () => {
    const c = review(newCard('w', 'meaning', NOW), 'good', NOW);
    expect(c.reps).toBe(1);
    expect(new Date(c.due).getTime()).toBeGreaterThan(NOW.getTime() + 86_400_000);
  });

  it('makes a lapsed card harder and an easy one easier', () => {
    const base = newCard('w', 'meaning', NOW);
    expect(review(base, 'again', NOW).difficulty).toBeGreaterThan(base.difficulty);
    expect(review(base, 'easy', NOW).difficulty).toBeLessThan(base.difficulty);
  });

  it('keeps difficulty inside its 1–10 band', () => {
    let c = newCard('w', 'meaning', NOW);
    for (let i = 0; i < 20; i++) c = review(c, 'again', NOW);
    expect(c.difficulty).toBeLessThanOrEqual(10);
    for (let i = 0; i < 40; i++) c = review(c, 'easy', NOW);
    expect(c.difficulty).toBeGreaterThanOrEqual(1);
  });

  it('marks a word mastered once it is produced from a long interval', () => {
    const c: Card = { ...newCard('w', 'production', NOW), reps: 5, stability: 20 };
    expect(review(c, 'good', NOW).mastered).toBe(true);
  });

  it('does not mark a word mastered from recognition alone', () => {
    const c: Card = { ...newCard('w', 'meaning', NOW), reps: 5, stability: 40 };
    expect(review(c, 'easy', NOW).mastered).toBe(false);
  });
});

describe('dueCards', () => {
  const overdue = (wordId: string, facet: Card['facet'], mins: number): Card => ({
    ...newCard(wordId, facet, NOW),
    due: new Date(NOW.getTime() - mins * 60_000).toISOString(),
  });

  it('leaves out cards that are not due yet', () => {
    const future: Card = { ...newCard('a', 'meaning', NOW), due: at('2026-09-25T10:00:00.000Z').toISOString() };
    expect(dueCards([future], 10, NOW)).toHaveLength(0);
  });

  it('honours the cap, so the learner never faces a wall', () => {
    const cards = Array.from({ length: 30 }, (_, i) => overdue(`w${i}`, 'meaning', 30));
    expect(dueCards(cards, 8, NOW)).toHaveLength(8);
  });

  it('spreads the three facets of one word instead of stacking them', () => {
    const cards = [
      overdue('a', 'meaning', 50),
      overdue('a', 'production', 49),
      overdue('a', 'listening', 48),
      overdue('b', 'meaning', 47),
      overdue('b', 'production', 46),
    ];
    const order = dueCards(cards, 5, NOW).map((c) => c.wordId);
    // a and b alternate rather than a,a,a,b,b
    expect(order.slice(0, 4)).toEqual(['a', 'b', 'a', 'b']);
  });

  it('returns every due card when the cap is generous', () => {
    const cards = [overdue('a', 'meaning', 5), overdue('b', 'meaning', 4)];
    expect(dueCards(cards, 50, NOW)).toHaveLength(2);
  });

  it('is empty on an empty deck', () => {
    expect(dueCards([], 8, NOW)).toEqual([]);
  });
});

describe('interval ceiling', () => {
  it('caps the interval so a long-lived card still has a valid due date', () => {
    let c = newCard('w', 'meaning', NOW);
    for (let i = 0; i < 40; i++) c = review(c, 'easy', NOW);
    expect(nextInterval(c, 'easy')).toBeLessThanOrEqual(MAX_INTERVAL_DAYS);
    expect(Number.isNaN(new Date(c.due).getTime())).toBe(false);
  });
});
