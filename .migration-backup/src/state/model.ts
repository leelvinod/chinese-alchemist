/* Mandarin Mitra — the persisted model.
   Everything the app knows about a learner lives here, in one serialisable
   object. There is no backend in this first version: the store is the source of
   truth and localStorage is the disk. */

import type { HskLevel } from '../content/types';
import type { LadderState } from '../engine/ladder';
import type { Card } from '../engine/srs';
import type { ErrorCode } from '../engine/errors';
import type { CheckedAnswer, QueuedAnswer } from '../engine/queue';

export type Goal = 'hsk' | 'work' | 'travel' | 'curious';

export const GOAL_LABEL: Record<Goal, string> = {
  hsk: 'Pass HSK',
  work: 'Use Chinese at work',
  travel: 'Travel and everyday talk',
  curious: 'Just curious',
};

export const GOAL_ICON: Record<Goal, string> = {
  hsk: 'book',
  work: 'grid',
  travel: 'plane',
  curious: 'spark',
};

export type ReminderSlot = 'morning' | 'lunch' | 'evening' | 'custom';

export interface Settings {
  goal: Goal;
  /** 'off' is the "English only" choice from ON-04. */
  hindi: 'deva' | 'roman' | 'off';
  /** Pinyin display: always, fade once mastered, or off. */
  pinyin: 'always' | 'fade' | 'off';
  theme: 'light' | 'dark' | 'system';
  /** The mono slot palette, kept as an accessibility setting. */
  monoSlots: boolean;
  /** Show the Hindi alignment line under sentences by default. */
  alignment: boolean;
  reviewCap: number;
  sessionLength: 3 | 5 | 10;
  reminders: ReminderSlot[];
  customReminder: string;
  answerInNotification: boolean;
  ttsRate: 0.8 | 1;
  voiceVariety: boolean;
  zhScale: 1 | 1.15 | 1.3;
  micAllowed: boolean;
  plus: boolean;
}

export const defaultSettings = (): Settings => ({
  goal: 'travel',
  hindi: 'deva',
  pinyin: 'fade',
  theme: 'system',
  monoSlots: false,
  alignment: true,
  reviewCap: 40,
  sessionLength: 3,
  reminders: ['evening'],
  customReminder: '21:00',
  answerInNotification: true,
  ttsRate: 1,
  voiceVariety: true,
  zhScale: 1,
  micAllowed: false,
  plus: false,
});

/** One graded answer, kept so Progress can show trends and recent examples. */
export interface AttemptLog {
  at: string;
  patternId: string;
  drillId: string;
  answer: string;
  correction: string;
  firstTry: boolean;
  codes: ErrorCode[];
}

export interface SessionRecord {
  date: string;
  patternId: string;
  drillsDone: number;
  firstTryCorrect: number;
  reviewsDone: number;
}

export interface Progress {
  /** Per pattern. */
  ladders: Record<string, LadderState>;
  cards: Card[];
  attempts: AttemptLog[];
  sessions: SessionRecord[];
  /** ISO dates on which the streak was kept. */
  activeDays: string[];
  streak: number;
  longestStreak: number;
  /** Graded voice answers used today, against the free cap. */
  voiceToday: number;
  voiceDate: string;
  /** Words the learner has met at all, for the know-vs-use bars. */
  seenWords: string[];
  producedWords: string[];
  /** Tone-pair accuracy, keyed "1-2". */
  tonePairStats: Record<string, { right: number; total: number }>;
  minimalPairStats: Record<string, { right: number; total: number }>;
}

export const emptyProgress = (): Progress => ({
  ladders: {},
  cards: [],
  attempts: [],
  sessions: [],
  activeDays: [],
  streak: 0,
  longestStreak: 0,
  voiceToday: 0,
  voiceDate: '',
  seenWords: [],
  producedWords: [],
  tonePairStats: {},
  minimalPairStats: {},
});

export interface AppState {
  version: 1;
  /** null until onboarding finishes. */
  name: string;
  signedIn: boolean;
  onboarded: boolean;
  /** Set when the learner skips or abandons placement. */
  placementDone: boolean;
  placementSkipped: boolean;
  hsk: HskLevel;
  placementNote: { strongest: string; weakest: string; speakingTested: boolean } | null;
  settings: Settings;
  progress: Progress;
  queue: QueuedAnswer[];
  checked: CheckedAnswer[];
  /** Dismissed transfer cards, so one is never shown twice in a row. */
  dismissedTransfer: string[];
}

export const FREE_VOICE_CAP = 5;

export const initialState = (): AppState => ({
  version: 1,
  name: '',
  signedIn: false,
  onboarded: false,
  placementDone: false,
  placementSkipped: false,
  hsk: 1,
  placementNote: null,
  settings: defaultSettings(),
  progress: emptyProgress(),
  queue: [],
  checked: [],
  dismissedTransfer: [],
});

export const todayISO = (d = new Date()) => d.toISOString().slice(0, 10);
