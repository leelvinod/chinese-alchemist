/* Mandarin Mitra — reminder rules (§13).
   Notifications carry real practice, not just nagging, and they get quieter when
   they are being ignored rather than louder. All of this is pure so the rules
   can be tested without a clock or a notification permission. */

import type { Pattern } from '../content/types';
import type { ReminderSlot } from '../state/model';

/** How loud reminders should be, given how long the learner has been silent. */
export type ReminderTier = 'normal' | 'quiet' | 'sparse';

export const QUIET_AFTER_DAYS = 3;
export const SPARSE_AFTER_DAYS = 7;

export function reminderTier(daysSinceLastAnswer: number): ReminderTier {
  if (daysSinceLastAnswer >= SPARSE_AFTER_DAYS) return 'sparse';
  if (daysSinceLastAnswer >= QUIET_AFTER_DAYS) return 'quiet';
  return 'normal';
}

/** Clock times for the preset slots, as minutes past midnight. */
export const SLOT_TIME: Record<Exclude<ReminderSlot, 'custom'>, number> = {
  morning: 8 * 60 + 30,
  lunch: 14 * 60,
  evening: 21 * 60,
};

export const SLOT_LABEL: Record<ReminderSlot, string> = {
  morning: 'Morning commute',
  lunch: 'After lunch',
  evening: 'Evening',
  custom: 'Custom',
};

/** "21:00" to minutes past midnight, or null when it is not a time. */
export function parseClock(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export const formatClock = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** The slot times the learner has switched on, in clock order. */
export function slotTimes(slots: readonly ReminderSlot[], custom: string): number[] {
  const out: number[] = [];
  for (const s of slots) {
    if (s === 'custom') {
      const t = parseClock(custom);
      if (t !== null) out.push(t);
    } else {
      out.push(SLOT_TIME[s]);
    }
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

/** On the sparse tier reminders drop to twice a week, on Monday and Thursday,
 *  so a learner who has drifted away is not pinged every day. */
export const SPARSE_DAYS = [1, 4];

export function sendsOn(tier: ReminderTier, date: Date): boolean {
  if (tier !== 'sparse') return true;
  return SPARSE_DAYS.includes(date.getDay());
}

/** When the next reminder should fire, or null when reminders are off. */
export function nextReminderAt(
  now: Date,
  slots: readonly ReminderSlot[],
  custom: string,
  tier: ReminderTier,
): Date | null {
  const times = slotTimes(slots, custom);
  if (times.length === 0) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Look at today first, then walk forward until a day this tier sends on.
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    if (!sendsOn(tier, day)) continue;

    for (const t of times) {
      if (dayOffset === 0 && t <= nowMinutes) continue;
      const at = new Date(day);
      at.setHours(Math.floor(t / 60), t % 60, 0, 0);
      return at;
    }
  }
  return null;
}

/* ── what the notification says ─────────────────────────────────────────── */

export interface ReminderPrompt {
  drillId: string;
  patternId: string;
  /** The English prompt the learner answers in Chinese. */
  en: string;
  /** The model answer, for the result line. */
  zh: string;
}

/** Spoken drills at or below the learner's level — a notification asks for one
 *  sentence, so only say-it drills qualify. */
export function promptPool(patterns: readonly Pattern[], hsk: number): ReminderPrompt[] {
  const out: ReminderPrompt[] = [];
  for (const p of patterns) {
    if (p.hsk > Math.max(1, hsk)) continue;
    for (const d of p.drills) {
      if (d.kind !== 'sayit') continue;
      out.push({ drillId: d.id, patternId: p.id, en: d.target.en, zh: d.target.zh });
    }
  }
  return out;
}

/** The next prompt to send. The same prompt is never sent twice in a row. */
export function nextPrompt(pool: readonly ReminderPrompt[], lastDrillId: string | null): ReminderPrompt | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0] ?? null;
  const fresh = pool.filter((p) => p.drillId !== lastDrillId);
  const i = Math.floor(Math.random() * fresh.length);
  return fresh[i] ?? fresh[0] ?? null;
}

/** The collapsed notification line. On the quiet tier it asks for less. */
export function collapsedCopy(tier: ReminderTier, prompt: ReminderPrompt): string {
  if (tier === 'normal') return `Say it in Chinese: ${prompt.en}`;
  return 'Just one word today?';
}

export const notificationTitle = (tier: ReminderTier): string =>
  tier === 'normal' ? 'One sentence keeps your streak' : 'Still here when you are';

/** The result line after a graded answer from the notification. */
export function resultCopy(pass: boolean, zh: string): string {
  return pass ? `Nice — ${zh}.` : 'Almost — tap to fix it.';
}

/** Whole days between two moments, floored — how silence is counted. */
export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
