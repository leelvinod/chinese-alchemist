import { describe, expect, it } from 'vitest';
import { reducer } from './store';
import type { Action } from './store';
import { FREE_VOICE_CAP, initialState, todayISO } from './model';
import type { AppState } from './model';
import { newCard } from '../engine/srs';

const onboarded = (): AppState => {
  let s = reducer(initialState(), { type: 'signIn', name: 'Priya' });
  s = reducer(s, { type: 'finishPlacement', hsk: 2, note: { strongest: 'Vocabulary', weakest: 'Word order', speakingTested: true } });
  return reducer(s, { type: 'finishOnboarding' });
};

const attempt = (pass: boolean, firstTry = true): Extract<Action, { type: 'logAttempt' }> => ({
  type: 'logAttempt',
  patternId: 'time-before-verb',
  drillId: 'tbv-reorder-1',
  answer: '我明天去台北',
  correction: '我明天去台北',
  firstTry,
  pass,
  codes: pass ? [] : ['WORD_ORDER.time_after_verb'],
});

describe('onboarding', () => {
  it('seeds the review deck from the placed level, so Today has work to do', () => {
    const s = onboarded();
    expect(s.progress.cards.length).toBeGreaterThan(0);
    expect(s.onboarded).toBe(true);
  });

  it('gives every seeded word all three facets', () => {
    const s = onboarded();
    const byWord = new Map<string, number>();
    for (const c of s.progress.cards) byWord.set(c.wordId, (byWord.get(c.wordId) ?? 0) + 1);
    expect([...byWord.values()].every((n) => n === 3)).toBe(true);
  });

  it('does not seed words above the placed level', () => {
    const s = onboarded();
    // HSK 4 vocabulary must not appear in an HSK 2 learner's starting deck.
    expect(s.progress.seenWords).not.toContain('v-zhide');
  });

  it('starts at HSK 1 when placement is skipped', () => {
    const s = reducer(initialState(), { type: 'skipPlacement' });
    expect(s.hsk).toBe(1);
    expect(s.placementSkipped).toBe(true);
  });
});

describe('logAttempt — ladders', () => {
  it('records the attempt for the progress trends', () => {
    const s = reducer(onboarded(), attempt(false));
    expect(s.progress.attempts).toHaveLength(1);
    expect(s.progress.attempts[0]?.codes).toContain('WORD_ORDER.time_after_verb');
  });

  it('promotes after three first-try passes', () => {
    let s = onboarded();
    for (let i = 0; i < 3; i++) s = reducer(s, attempt(true));
    expect(s.progress.ladders['time-before-verb']?.step).toBe(1);
  });

  it('does not let a second-try pass count towards promotion', () => {
    let s = onboarded();
    for (let i = 0; i < 5; i++) s = reducer(s, attempt(true, false));
    expect(s.progress.ladders['time-before-verb']?.step).toBe(0);
  });

  it('clears the miss counter when a second-try pass lands', () => {
    let s = onboarded();
    s = reducer(s, attempt(false));
    s = reducer(s, attempt(true, false));
    expect(s.progress.ladders['time-before-verb']?.misses).toBe(0);
  });
});

describe('logAttempt — streak', () => {
  it('one graded sentence keeps the streak', () => {
    const s = reducer(onboarded(), attempt(true));
    expect(s.progress.streak).toBe(1);
    expect(s.progress.activeDays).toContain(todayISO());
  });

  it('does not count the same day twice', () => {
    let s = onboarded();
    s = reducer(s, attempt(true));
    s = reducer(s, attempt(true));
    expect(s.progress.streak).toBe(1);
  });

  it('a wrong answer still keeps the streak — the sentence was attempted', () => {
    const s = reducer(onboarded(), attempt(false));
    expect(s.progress.streak).toBe(1);
  });

  it('records the longest streak so Progress can show it after a miss', () => {
    const s = reducer(onboarded(), attempt(true));
    expect(s.progress.longestStreak).toBe(1);
  });

  it('restarts rather than continuing when yesterday was missed', () => {
    const stale = onboarded();
    const old = todayISO(new Date(Date.now() - 5 * 86_400_000));
    const s = reducer(
      { ...stale, progress: { ...stale.progress, activeDays: [old], streak: 7, longestStreak: 7 } },
      attempt(true),
    );
    expect(s.progress.streak).toBe(1);
    expect(s.progress.longestStreak).toBe(7);
  });
});

describe('voice cap', () => {
  it('counts graded voice answers towards the free daily cap', () => {
    let s = onboarded();
    for (let i = 0; i < 3; i++) s = reducer(s, { ...attempt(true), spoken: true });
    expect(s.progress.voiceToday).toBe(3);
    expect(s.progress.voiceDate).toBe(todayISO());
  });

  it('does not count typed answers', () => {
    const s = reducer(onboarded(), attempt(true));
    expect(s.progress.voiceToday).toBe(0);
  });

  it('resets when the date rolls over', () => {
    const base = onboarded();
    const yesterday = todayISO(new Date(Date.now() - 86_400_000));
    const s = reducer(
      { ...base, progress: { ...base.progress, voiceToday: FREE_VOICE_CAP, voiceDate: yesterday } },
      { ...attempt(true), spoken: true },
    );
    expect(s.progress.voiceToday).toBe(1);
  });
});

describe('gradeCard', () => {
  it('replaces only the graded facet of that word', () => {
    const s = onboarded();
    const card = s.progress.cards.find((c) => c.facet === 'meaning');
    if (!card) throw new Error('no seeded card');
    const after = reducer(s, { type: 'gradeCard', card, grade: 'good' });
    const same = after.progress.cards.find((c) => c.wordId === card.wordId && c.facet === 'meaning');
    const other = after.progress.cards.find((c) => c.wordId === card.wordId && c.facet === 'listening');
    expect(same?.reps).toBe(1);
    expect(other?.reps).toBe(0);
  });

  it('counts a word as used once it is produced', () => {
    const s = onboarded();
    const card = s.progress.cards.find((c) => c.facet === 'production');
    if (!card) throw new Error('no production card');
    const after = reducer(s, { type: 'gradeCard', card, grade: 'good' });
    expect(after.progress.producedWords).toContain(card.wordId);
  });

  it('does not count a word as used when the learner pressed Again', () => {
    const s = onboarded();
    const card = s.progress.cards.find((c) => c.facet === 'production');
    if (!card) throw new Error('no production card');
    const after = reducer(s, { type: 'gradeCard', card, grade: 'again' });
    expect(after.progress.producedWords).not.toContain(card.wordId);
  });
});

describe('seedCards', () => {
  it('adds new words without duplicating ones already in the deck', () => {
    const s = onboarded();
    const existing = s.progress.cards.length;
    const again = reducer(s, { type: 'seedCards', wordIds: [s.progress.seenWords[0]!, 'v-zhide'] });
    expect(again.progress.cards.length).toBe(existing + 3);
  });

  it('is a no-op when nothing is new', () => {
    const s = onboarded();
    expect(reducer(s, { type: 'seedCards', wordIds: s.progress.seenWords })).toBe(s);
  });
});

describe('offline queue', () => {
  const queued = {
    id: 'q1',
    patternId: 'time-before-verb',
    drillId: 'tbv-translate-1',
    answer: '我昨天看电影',
    target: { zh: '我昨天看电影', en: 'I watched a film yesterday.', chunks: [] },
    loose: false,
    queuedAt: new Date().toISOString(),
  };

  it('holds an answer made offline', () => {
    const s = reducer(onboarded(), { type: 'enqueue', item: queued });
    expect(s.queue).toHaveLength(1);
  });

  it('grades the queue on drain and moves the results to "checked"', () => {
    let s = reducer(onboarded(), { type: 'enqueue', item: queued });
    s = reducer(s, { type: 'drain' });
    expect(s.queue).toHaveLength(0);
    expect(s.checked).toHaveLength(1);
    expect(s.checked[0]?.result.pass).toBe(true);
  });

  it('draining an empty queue changes nothing', () => {
    const s = onboarded();
    expect(reducer(s, { type: 'drain' })).toBe(s);
  });

  it('clears the checked card once the learner has seen it', () => {
    let s = reducer(onboarded(), { type: 'enqueue', item: queued });
    s = reducer(s, { type: 'drain' });
    expect(reducer(s, { type: 'clearChecked' }).checked).toHaveLength(0);
  });
});

describe('settings and reset', () => {
  it('patches only the named settings', () => {
    const s = reducer(onboarded(), { type: 'setSettings', patch: { hindi: 'roman' } });
    expect(s.settings.hindi).toBe('roman');
    expect(s.settings.pinyin).toBe('fade');
  });

  it('reset clears progress as well as settings', () => {
    let s = reducer(onboarded(), attempt(true));
    s = reducer(s, { type: 'reset' });
    expect(s.progress.attempts).toHaveLength(0);
    expect(s.onboarded).toBe(false);
  });
});

describe('listening stats', () => {
  it('accumulates tone-pair accuracy per pair', () => {
    let s = reducer(onboarded(), { type: 'tonePairResult', key: '2-1', right: true });
    s = reducer(s, { type: 'tonePairResult', key: '2-1', right: false });
    expect(s.progress.tonePairStats['2-1']).toEqual({ right: 1, total: 2 });
  });

  it('accumulates minimal-pair accuracy per contrast', () => {
    const s = reducer(onboarded(), { type: 'minimalPairResult', contrast: '-n / -ng', right: true });
    expect(s.progress.minimalPairStats['-n / -ng']).toEqual({ right: 1, total: 1 });
  });
});

describe('newCard', () => {
  it('is the same shape the reducer seeds', () => {
    const c = newCard('v-jia', 'meaning');
    expect(c.reps).toBe(0);
    expect(c.mastered).toBe(false);
  });
});
