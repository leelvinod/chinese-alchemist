/* Mandarin Mitra — the offline grading queue (§15).
   A graded production answer made offline is saved, the next drill continues,
   and the results appear later in a "Checked while you were away" card on Today. */

import { grade } from './grader';
import type { GradeResult } from './grader';
import type { Sentence } from '../content/types';

export interface QueuedAnswer {
  id: string;
  patternId: string;
  drillId: string;
  answer: string;
  target: Sentence;
  loose: boolean;
  queuedAt: string;
}

export interface CheckedAnswer extends QueuedAnswer {
  result: GradeResult;
  checkedAt: string;
}

/** Grade everything that was queued while offline. In production this posts to
 *  the hosted grader; the shape of the call is the same either way. */
export function drainQueue(queue: readonly QueuedAnswer[]): CheckedAnswer[] {
  const now = new Date().toISOString();
  return queue.map((q) => ({
    ...q,
    result: grade(q.answer, q.target, { loose: q.loose }),
    checkedAt: now,
  }));
}

export const isOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false);
