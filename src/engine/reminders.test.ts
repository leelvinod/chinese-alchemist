import { describe, expect, it } from 'vitest';
import {
  collapsedCopy,
  daysBetween,
  formatClock,
  nextPrompt,
  nextReminderAt,
  parseClock,
  promptPool,
  reminderTier,
  resultCopy,
  sendsOn,
  slotTimes,
} from './reminders';
import type { ReminderPrompt } from './reminders';
import { PATTERNS } from '../content/patterns';
import type { ReminderSlot } from '../state/model';

const at = (iso: string) => new Date(iso);

describe('reminderTier — adaptive silence', () => {
  it('stays normal while the learner is answering', () => {
    expect(reminderTier(0)).toBe('normal');
    expect(reminderTier(2)).toBe('normal');
  });

  it('goes quiet after three silent days', () => {
    expect(reminderTier(3)).toBe('quiet');
    expect(reminderTier(6)).toBe('quiet');
  });

  it('drops to twice a week after seven', () => {
    expect(reminderTier(7)).toBe('sparse');
    expect(reminderTier(40)).toBe('sparse');
  });
});

describe('clock times', () => {
  it('reads a custom time', () => {
    expect(parseClock('21:00')).toBe(21 * 60);
    expect(parseClock('7:05')).toBe(7 * 60 + 5);
  });

  it('refuses something that is not a time', () => {
    expect(parseClock('nine')).toBeNull();
    expect(parseClock('25:00')).toBeNull();
    expect(parseClock('21:70')).toBeNull();
  });

  it('writes a time back the way settings shows it', () => {
    expect(formatClock(21 * 60)).toBe('21:00');
    expect(formatClock(8 * 60 + 30)).toBe('08:30');
  });
});

describe('slotTimes', () => {
  it('returns the preset times in clock order', () => {
    expect(slotTimes(['evening', 'morning'], '')).toEqual([8 * 60 + 30, 21 * 60]);
  });

  it('includes a valid custom time', () => {
    expect(slotTimes(['custom'], '06:15')).toEqual([6 * 60 + 15]);
  });

  it('skips a custom slot with an unusable time rather than guessing one', () => {
    expect(slotTimes(['custom'], 'later')).toEqual([]);
  });

  it('never returns the same minute twice', () => {
    expect(slotTimes(['evening', 'custom'], '21:00')).toEqual([21 * 60]);
  });
});

describe('nextReminderAt', () => {
  const slots: ReminderSlot[] = ['morning', 'evening'];

  it('picks the next slot later the same day', () => {
    const next = nextReminderAt(at('2026-09-21T06:00:00'), slots, '', 'normal');
    expect(next?.getHours()).toBe(8);
    expect(next?.getMinutes()).toBe(30);
    expect(next?.getDate()).toBe(21);
  });

  it('rolls to tomorrow once the day\'s slots have passed', () => {
    const next = nextReminderAt(at('2026-09-21T22:00:00'), slots, '', 'normal');
    expect(next?.getDate()).toBe(22);
    expect(next?.getHours()).toBe(8);
  });

  it('never schedules a reminder in the past', () => {
    const now = at('2026-09-21T12:00:00');
    const next = nextReminderAt(now, slots, '', 'normal');
    expect(next!.getTime()).toBeGreaterThan(now.getTime());
  });

  it('returns nothing when the learner has switched reminders off', () => {
    expect(nextReminderAt(at('2026-09-21T06:00:00'), [], '', 'normal')).toBeNull();
  });

  it('on the sparse tier only lands on a day that tier sends on', () => {
    const next = nextReminderAt(at('2026-09-21T22:00:00'), slots, '', 'sparse');
    expect(next).not.toBeNull();
    expect(sendsOn('sparse', next!)).toBe(true);
  });
});

describe('sendsOn', () => {
  it('sends every day on the normal and quiet tiers', () => {
    for (let d = 0; d < 7; d++) {
      const day = at('2026-09-20T12:00:00');
      day.setDate(day.getDate() + d);
      expect(sendsOn('normal', day)).toBe(true);
      expect(sendsOn('quiet', day)).toBe(true);
    }
  });

  it('sends twice a week on the sparse tier', () => {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const day = at('2026-09-20T12:00:00');
      day.setDate(day.getDate() + d);
      if (sendsOn('sparse', day)) days.push(day.getDay());
    }
    expect(days).toHaveLength(2);
  });
});

describe('promptPool', () => {
  it('offers only spoken drills — a notification asks for one sentence', () => {
    const pool = promptPool(PATTERNS, 4);
    expect(pool.length).toBeGreaterThan(0);
    for (const p of pool) {
      const pattern = PATTERNS.find((x) => x.id === p.patternId);
      expect(pattern?.drills.find((d) => d.id === p.drillId)?.kind).toBe('sayit');
    }
  });

  it('never offers a pattern above the learner level', () => {
    for (const p of promptPool(PATTERNS, 1)) {
      expect(PATTERNS.find((x) => x.id === p.patternId)?.hsk).toBe(1);
    }
  });

  it('carries the model answer, for the result line', () => {
    for (const p of promptPool(PATTERNS, 4)) expect(p.zh.length).toBeGreaterThan(0);
  });
});

describe('nextPrompt', () => {
  const pool: ReminderPrompt[] = [
    { drillId: 'a', patternId: 'p', en: 'A', zh: '一' },
    { drillId: 'b', patternId: 'p', en: 'B', zh: '二' },
    { drillId: 'c', patternId: 'p', en: 'C', zh: '三' },
  ];

  it('never sends the same prompt twice in a row', () => {
    for (let i = 0; i < 40; i++) expect(nextPrompt(pool, 'b')?.drillId).not.toBe('b');
  });

  it('still returns something when only one prompt exists', () => {
    expect(nextPrompt([pool[0]!], 'a')?.drillId).toBe('a');
  });

  it('returns nothing from an empty pool', () => {
    expect(nextPrompt([], null)).toBeNull();
  });
});

describe('copy', () => {
  const prompt: ReminderPrompt = {
    drillId: 'd',
    patternId: 'p',
    en: "I'm going to Taipei tomorrow.",
    zh: '我明天去台北',
  };

  it('asks for the sentence on the normal tier', () => {
    expect(collapsedCopy('normal', prompt)).toBe("Say it in Chinese: I'm going to Taipei tomorrow.");
  });

  it('asks for much less once it is being ignored', () => {
    expect(collapsedCopy('quiet', prompt)).toBe('Just one word today?');
    expect(collapsedCopy('sparse', prompt)).toBe('Just one word today?');
  });

  it('reports a pass with the sentence, and a miss without shaming', () => {
    expect(resultCopy(true, '我明天去台北')).toBe('Nice — 我明天去台北.');
    expect(resultCopy(false, '我明天去台北')).toBe('Almost — tap to fix it.');
    expect(resultCopy(false, '我明天去台北')).not.toMatch(/wrong|fail|lost/i);
  });
});

describe('daysBetween', () => {
  it('counts whole days, not hours', () => {
    expect(daysBetween(at('2026-09-19T23:00:00'), at('2026-09-20T01:00:00'))).toBe(1);
    expect(daysBetween(at('2026-09-19T01:00:00'), at('2026-09-19T23:00:00'))).toBe(0);
  });

  it('never goes negative', () => {
    expect(daysBetween(at('2026-09-25T12:00:00'), at('2026-09-20T12:00:00'))).toBe(0);
  });
});
