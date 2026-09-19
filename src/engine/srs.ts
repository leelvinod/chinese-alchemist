/* Mandarin Mitra — the review scheduler.
   FSRS-inspired, cut down to what the MVP shows: a stability value per card, a
   difficulty value, and four grades whose next interval the buttons display.
   Reviews are capped per day so the learner never faces a wall of cards. */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export type Facet = 'meaning' | 'production' | 'listening';

export interface Card {
  wordId: string;
  facet: Facet;
  /** Days. */
  stability: number;
  /** 1 (easy) – 10 (hard). */
  difficulty: number;
  /** ISO date-time of the next due moment. */
  due: string;
  reps: number;
  lapses: number;
  /** Set once the learner has produced the word correctly — the pinyin can fade. */
  mastered: boolean;
}

export const GRADES: readonly Grade[] = ['again', 'hard', 'good', 'easy'];

const GRADE_LABEL: Record<Grade, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
};

export const gradeLabel = (g: Grade) => GRADE_LABEL[g];

export function newCard(wordId: string, facet: Facet, now = new Date()): Card {
  return {
    wordId,
    facet,
    stability: 0,
    difficulty: 5,
    due: now.toISOString(),
    reps: 0,
    lapses: 0,
    mastered: false,
  };
}

const W = { again: 0, hard: 1.2, good: 2.5, easy: 4.2 } as const;

/** Ten years. Without a ceiling, repeated Easy grades grow the interval until the
 *  due date falls outside the range a Date can hold. */
export const MAX_INTERVAL_DAYS = 3650;

/** The next interval in days, before it is written to the card. */
export function nextInterval(card: Card, grade: Grade): number {
  if (grade === 'again') return 0; // same session, ten minutes later
  const first = card.reps === 0 || card.stability === 0;
  if (first) return grade === 'hard' ? 1 : grade === 'good' ? 2 : 4;
  const ease = (11 - card.difficulty) / 6; // 1.0 at difficulty 5
  const raw = card.stability * W[grade] * ease;
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(raw)));
}

/** A short, plain label for the interval, shown under each grade button. */
export function intervalLabel(days: number): string {
  if (days <= 0) return '10 min';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}

export function review(card: Card, grade: Grade, now = new Date()): Card {
  const days = nextInterval(card, grade);
  const due = new Date(now.getTime() + (days > 0 ? days * 86_400_000 : 10 * 60_000));
  const dDelta = grade === 'again' ? 1.4 : grade === 'hard' ? 0.5 : grade === 'easy' ? -0.6 : -0.1;
  return {
    ...card,
    stability: grade === 'again' ? Math.max(0.5, card.stability * 0.4) : Math.max(days, 1),
    difficulty: Math.min(10, Math.max(1, card.difficulty + dDelta)),
    due: due.toISOString(),
    reps: card.reps + 1,
    lapses: card.lapses + (grade === 'again' ? 1 : 0),
    mastered: card.mastered || (card.facet === 'production' && grade !== 'again' && card.stability >= 14),
  };
}

export function isDue(card: Card, now = new Date()): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

/** Due cards, oldest first, capped. Facets of the same word are spread out by
 *  dealing one facet per word per round, so the learner does not meet all three
 *  facets of 明天 back to back. */
export function dueCards(cards: readonly Card[], cap: number, now = new Date()): Card[] {
  const due = cards.filter((c) => isDue(c, now)).sort((a, b) => a.due.localeCompare(b.due));

  const byWord = new Map<string, Card[]>();
  for (const c of due) {
    const list = byWord.get(c.wordId);
    if (list) list.push(c);
    else byWord.set(c.wordId, [c]);
  }

  const out: Card[] = [];
  let dealt = true;
  while (dealt && out.length < cap) {
    dealt = false;
    for (const list of byWord.values()) {
      if (out.length >= cap) break;
      const c = list.shift();
      if (c) {
        out.push(c);
        dealt = true;
      }
    }
  }
  return out;
}
