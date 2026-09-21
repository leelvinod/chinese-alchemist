/* Mandarin Mitra — the store.
   A reducer over AppState, persisted to localStorage on every change. Actions
   are named after what the learner did, not after the fields they touch. */

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { FREE_VOICE_CAP, initialState, todayISO } from './model';
import type { AppState, Settings } from './model';
import type { HskLevel } from '../content/types';
import { advance, initialLadder } from '../engine/ladder';
import type { LadderState } from '../engine/ladder';
import { newCard, review } from '../engine/srs';
import type { Card, Facet, Grade } from '../engine/srs';
import type { ErrorCode } from '../engine/errors';
import { drainQueue } from '../engine/queue';
import type { QueuedAnswer } from '../engine/queue';
import { VOCAB } from '../content/vocab';
import type { ImportedWord } from '../engine/import';

const KEY = 'mandarin-mitra:v1';

export type Action =
  | { type: 'signIn'; name: string }
  | { type: 'setSettings'; patch: Partial<Settings> }
  | { type: 'finishPlacement'; hsk: HskLevel; note: AppState['placementNote'] }
  | { type: 'skipPlacement' }
  | { type: 'finishOnboarding' }
  | {
      type: 'logAttempt';
      patternId: string;
      drillId: string;
      answer: string;
      correction: string;
      firstTry: boolean;
      pass: boolean;
      codes: ErrorCode[];
      spoken?: boolean;
    }
  | { type: 'finishSession'; patternId: string; drillsDone: number; firstTryCorrect: number; reviewsDone: number }
  | { type: 'gradeCard'; card: Card; grade: Grade }
  | { type: 'seedCards'; wordIds: string[] }
  | { type: 'enqueue'; item: QueuedAnswer }
  | { type: 'drain' }
  | { type: 'clearChecked' }
  | { type: 'tonePairResult'; key: string; right: boolean }
  | { type: 'minimalPairResult'; contrast: string; right: boolean }
  | { type: 'dismissTransfer'; id: string }
  | { type: 'importWords'; words: ImportedWord[] }
  | { type: 'reset' };

function bumpStreak(state: AppState): AppState['progress'] {
  const today = todayISO();
  const p = state.progress;
  if (p.activeDays.includes(today)) return p;

  const yesterday = todayISO(new Date(Date.now() - 86_400_000));
  const streak = p.activeDays.includes(yesterday) ? p.streak + 1 : 1;
  return {
    ...p,
    activeDays: [...p.activeDays, today].slice(-400),
    streak,
    longestStreak: Math.max(p.longestStreak, streak),
  };
}

/** The three facets of a word become three cards the first time it is seen. */
function cardsFor(wordId: string): Card[] {
  const facets: Facet[] = ['meaning', 'production', 'listening'];
  return facets.map((f) => newCard(wordId, f));
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'signIn':
      return { ...state, signedIn: true, name: action.name };

    case 'setSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'finishPlacement':
      return { ...state, placementDone: true, hsk: action.hsk, placementNote: action.note };

    case 'skipPlacement':
      return { ...state, placementSkipped: true, hsk: 1 };

    case 'finishOnboarding': {
      // Seed the review deck from the learner's level so Today has something due.
      const words = VOCAB.filter((w) => w.hsk <= state.hsk).map((w) => w.id);
      const cards = words.flatMap(cardsFor);
      return {
        ...state,
        onboarded: true,
        progress: { ...state.progress, cards, seenWords: words },
      };
    }

    case 'logAttempt': {
      const p = state.progress;
      const prev: LadderState = p.ladders[action.patternId] ?? initialLadder();
      // Only a first-try pass counts towards promotion; a second-try pass just
      // clears the miss counter without advancing.
      const move = action.firstTry
        ? advance(prev, action.pass)
        : { next: { ...prev, streak: 0, misses: action.pass ? 0 : prev.misses + 1 }, moved: null as null };

      const today = todayISO();
      const voiceToday =
        action.spoken && p.voiceDate === today
          ? p.voiceToday + 1
          : action.spoken
            ? 1
            : p.voiceDate === today
              ? p.voiceToday
              : 0;

      const streaked = bumpStreak(state);

      return {
        ...state,
        progress: {
          ...streaked,
          ladders: { ...p.ladders, [action.patternId]: move.next },
          attempts: [
            ...p.attempts,
            {
              at: new Date().toISOString(),
              patternId: action.patternId,
              drillId: action.drillId,
              answer: action.answer,
              correction: action.correction,
              firstTry: action.firstTry,
              codes: action.codes,
            },
          ].slice(-400),
          voiceToday,
          voiceDate: today,
          producedWords:
            action.pass && action.spoken
              ? [...new Set([...p.producedWords, ...wordsIn(action.correction)])]
              : p.producedWords,
        },
      };
    }

    case 'finishSession':
      return {
        ...state,
        progress: {
          ...state.progress,
          sessions: [
            ...state.progress.sessions,
            {
              date: todayISO(),
              patternId: action.patternId,
              drillsDone: action.drillsDone,
              firstTryCorrect: action.firstTryCorrect,
              reviewsDone: action.reviewsDone,
            },
          ].slice(-200),
        },
      };

    case 'gradeCard': {
      const next = review(action.card, action.grade);
      return {
        ...state,
        progress: {
          ...state.progress,
          cards: state.progress.cards.map((c) =>
            c.wordId === action.card.wordId && c.facet === action.card.facet ? next : c,
          ),
          producedWords:
            action.card.facet === 'production' && action.grade !== 'again'
              ? [...new Set([...state.progress.producedWords, action.card.wordId])]
              : state.progress.producedWords,
        },
      };
    }

    case 'seedCards': {
      const have = new Set(state.progress.cards.map((c) => c.wordId));
      const add = action.wordIds.filter((id) => !have.has(id));
      if (add.length === 0) return state;
      return {
        ...state,
        progress: {
          ...state.progress,
          cards: [...state.progress.cards, ...add.flatMap(cardsFor)],
          seenWords: [...new Set([...state.progress.seenWords, ...add])],
        },
      };
    }

    case 'enqueue':
      return { ...state, queue: [...state.queue, action.item] };

    case 'drain': {
      if (state.queue.length === 0) return state;
      return { ...state, queue: [], checked: [...state.checked, ...drainQueue(state.queue)] };
    }

    case 'clearChecked':
      return { ...state, checked: [] };

    case 'tonePairResult': {
      const s = state.progress.tonePairStats[action.key] ?? { right: 0, total: 0 };
      return {
        ...state,
        progress: {
          ...state.progress,
          tonePairStats: {
            ...state.progress.tonePairStats,
            [action.key]: { right: s.right + (action.right ? 1 : 0), total: s.total + 1 },
          },
        },
      };
    }

    case 'minimalPairResult': {
      const s = state.progress.minimalPairStats[action.contrast] ?? { right: 0, total: 0 };
      return {
        ...state,
        progress: {
          ...state.progress,
          minimalPairStats: {
            ...state.progress.minimalPairStats,
            [action.contrast]: { right: s.right + (action.right ? 1 : 0), total: s.total + 1 },
          },
        },
      };
    }

    case 'dismissTransfer':
      return { ...state, dismissedTransfer: [...state.dismissedTransfer, action.id] };

    case 'importWords': {
      const have = new Set(state.imported.map((w) => w.id));
      const add = action.words.filter((w) => !have.has(w.id));
      if (add.length === 0) return state;
      return {
        ...state,
        imported: [...state.imported, ...add],
        progress: {
          ...state.progress,
          // Imported words join the review deck straight away, which is the only
          // reason to import them.
          cards: [...state.progress.cards, ...add.flatMap((w) => cardsFor(w.id))],
          seenWords: [...new Set([...state.progress.seenWords, ...add.map((w) => w.id)])],
        },
      };
    }

    case 'reset':
      return initialState();

    default:
      return state;
  }
}

/** Vocabulary words that appear in a graded sentence, for the know-vs-use bars. */
function wordsIn(zh: string): string[] {
  return VOCAB.filter((w) => zh.includes(w.zh)).map((w) => w.id);
}

function load(): AppState {
  if (typeof localStorage === 'undefined') return initialState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1) return initialState();
    const base = initialState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      progress: { ...base.progress, ...(parsed.progress ?? {}) },
      imported: parsed.imported ?? [],
    };
  } catch {
    return initialState();
  }
}

interface Ctx {
  state: AppState;
  dispatch: Dispatch<Action>;
  /** Voice answers left on the free plan today. */
  voiceLeft: number;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // A full or blocked store must not break the session; the learner keeps
      // practising, and progress is simply not carried to the next launch.
    }
  }, [state]);

  // Anything graded offline is checked as soon as the connection is back.
  useEffect(() => {
    const onOnline = () => dispatch({ type: 'drain' });
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const value = useMemo<Ctx>(() => {
    const today = todayISO();
    const used = state.progress.voiceDate === today ? state.progress.voiceToday : 0;
    return {
      state,
      dispatch,
      voiceLeft: state.settings.plus ? Infinity : Math.max(0, FREE_VOICE_CAP - used),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
