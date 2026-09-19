/* Mandarin Mitra — the grader.
   The PRD puts grading on a hosted service. This is the on-device grader that
   stands in for it: it compares the learner's sentence against the target,
   diagnoses the difference against the error taxonomy, and returns everything
   the feedback sheet needs — which chunk to flag, what to ask, whether it counts
   as correct. It never returns a bare pass/fail, because FB-01 has to ask a
   question about a specific slot without revealing the answer.

   Grading is deliberately structural rather than semantic: it knows word order,
   missing particles, and the 是/很 habit, which is what the MVP drills. Free
   composition ('build') is graded loosely — anything that uses the pattern's
   shape and no known error passes. */

import type { SentenceChunk } from '../design/Sentence';
import type { Sentence } from '../content/types';
import type { ErrorCode } from './errors';
import { selfCorrectPrompt } from './errors';
import { CONNECTOR_PAIRS } from '../content/patterns';

export type Verdict = 'correct' | 'minor' | 'error';

export interface Diagnosis {
  code: ErrorCode;
  /** The chunk the learner should look at, in hanzi. */
  chunk?: string;
  /** Where that chunk belongs, as an index into the target chunks. */
  belongsAt?: number;
  /** The one-line prompt for FB-01. */
  prompt: string;
}

export interface GradeResult {
  verdict: Verdict;
  /** True when the answer counts towards ladder movement. */
  pass: boolean;
  diagnoses: Diagnosis[];
  /** The learner's answer, chunked where we could align it. */
  attemptChunks: SentenceChunk[];
  /** A one-line note for a 'minor' verdict, e.g. a missing 了. */
  minorNote?: string;
}

/** Strip punctuation, spaces and Latin so two answers can be compared. */
export function normalise(s: string): string {
  return s
    .replace(/[\s,.!?;:'"·、，。！？；：「」“”‘’()（）]/g, '')
    .trim();
}

/** Split a target sentence's hanzi into the chunk strings it was built from. */
function chunkStrings(target: Sentence): string[] {
  return target.chunks.map((c) => c.zh);
}

/** Align the learner's sentence to the target's chunks, in the order they appear
 *  in the answer. Chunks the learner did not use are simply absent. */
export function alignToChunks(answer: string, target: Sentence): SentenceChunk[] {
  const out: SentenceChunk[] = [];
  let rest = normalise(answer);
  const pool = [...target.chunks];
  let guard = 0;
  while (rest.length > 0 && guard++ < 40) {
    const hit = pool.findIndex((c) => rest.startsWith(c.zh));
    if (hit >= 0) {
      const c = pool[hit];
      if (c) {
        out.push(c);
        rest = rest.slice(c.zh.length);
        pool.splice(hit, 1);
        continue;
      }
    }
    // Not a chunk we know: take one character and carry on, so an unexpected
    // word still shows up in the attempt line rather than vanishing.
    const ch = rest[0] ?? '';
    out.push({ slot: 'object', zh: ch, py: '' });
    rest = rest.slice(1);
  }
  return out;
}

/** Which slot a chunk belongs to in the target, by its hanzi. */
function slotOf(zh: string, target: Sentence): SentenceChunk | undefined {
  return target.chunks.find((c) => c.zh === zh);
}

const ORDER_CODE: Record<string, ErrorCode> = {
  time: 'WORD_ORDER.time_after_verb',
  place: 'WORD_ORDER.place_after_verb',
  companion: 'WORD_ORDER.companion_after_verb',
  manner: 'WORD_ORDER.manner_misplaced',
  object: 'WORD_ORDER.object_before_verb',
};

/** The verb and the subject are the anchors every skeleton is built around. When
 *  a chunk moves, they are what it moved past — so they are the last thing to
 *  blame for the displacement. */
const ANCHOR_SLOTS: readonly string[] = ['verb', 'subject'];

/** Diagnose a word-order difference: find the chunk the learner actually moved
 *  and say which slot it is, since that is what the self-correct prompt asks
 *  about. Chunks that merely shifted to make room are not the error. */
function diagnoseOrder(answerChunks: string[], targetChunks: string[], target: Sentence): Diagnosis[] {
  const moved = answerChunks
    .map((zh, from) => ({ zh, from, at: targetChunks.indexOf(zh) }))
    .filter((m) => m.at !== -1 && m.at !== m.from)
    .map((m) => ({ ...m, dist: Math.abs(m.at - m.from) }));

  if (moved.length === 0) return [];

  const maxDist = Math.max(...moved.map((m) => m.dist));
  const tied = moved.filter((m) => m.dist === maxDist);

  // Among equally displaced chunks, blame the one that is not an anchor: in
  // 我去明天台北 both 去 and 明天 are one step out, but the learner moved 明天.
  const pick =
    tied.find((m) => {
      const c = slotOf(m.zh, target);
      return c && !ANCHOR_SLOTS.includes(c.slot);
    }) ?? tied[0];

  if (!pick) return [];

  const c = slotOf(pick.zh, target);
  const slot = c?.slot ?? 'object';
  const code = ORDER_CODE[slot] ?? 'WORD_ORDER.manner_misplaced';

  return [
    {
      code,
      chunk: pick.zh,
      belongsAt: pick.at,
      prompt: selfCorrectPrompt(code, pick.zh),
    },
  ];
}

/** Particles and habits whose absence or presence is diagnosable on its own. */
function diagnoseLexis(answer: string, target: Sentence): Diagnosis[] {
  const a = normalise(answer);
  const t = normalise(target.zh);
  const out: Diagnosis[] = [];

  // 是 before an adjective — the Hindi है habit.
  if (a.includes('是') && !t.includes('是')) {
    out.push({
      code: 'COPULA.shi_before_adjective',
      chunk: '是',
      prompt: selfCorrectPrompt('COPULA.shi_before_adjective'),
    });
    return out;
  }

  // An opened connector with no second half.
  for (const [first, pair] of Object.entries(CONNECTOR_PAIRS)) {
    if (a.includes(first) && !a.includes(pair.second) && t.includes(pair.second)) {
      out.push({
        code: 'CONNECTOR.missing_second',
        chunk: first,
        prompt: selfCorrectPrompt('CONNECTOR.missing_second'),
      });
      return out;
    }
  }

  // A missing particle. 了 and 的 are the two the MVP drills.
  for (const [p, code] of [
    ['了', 'PARTICLE.le_missing'],
    ['得', 'PARTICLE.de_missing'],
    ['吗', 'PARTICLE.ma_missing'],
  ] as [string, ErrorCode][]) {
    if (t.includes(p) && !a.includes(p)) {
      out.push({ code, chunk: p, prompt: selfCorrectPrompt(code) });
      return out;
    }
  }

  // Measure words: the target has 数 + 量 + noun. If the learner used a measure
  // word but the wrong one, that is the more useful thing to say; only a bare
  // number with no measure word at all is "missing".
  const MEASURE = /[一二三四五六七八九十两几]([个本杯只件张位份家部条])/;
  const wantMw = t.match(MEASURE)?.[1];
  const gotMw = a.match(MEASURE)?.[1];
  if (wantMw && gotMw && gotMw !== wantMw) {
    out.push({
      code: 'MEASURE.wrong_classifier',
      chunk: gotMw,
      prompt: selfCorrectPrompt('MEASURE.wrong_classifier'),
    });
    return out;
  }
  if (wantMw && !gotMw) {
    out.push({
      code: 'MEASURE.missing',
      chunk: wantMw,
      prompt: selfCorrectPrompt('MEASURE.missing'),
    });
    return out;
  }

  return out;
}

/** Everything in the target that the answer never mentions. */
function missingChunks(answerChunks: string[], targetChunks: string[]): string[] {
  const pool = [...answerChunks];
  const missing: string[] = [];
  for (const t of targetChunks) {
    const i = pool.indexOf(t);
    if (i === -1) missing.push(t);
    else pool.splice(i, 1);
  }
  return missing;
}

export interface GradeOptions {
  /** 'build' and 'sayit' are graded loosely: the learner is composing. */
  loose?: boolean;
}

export function grade(answer: string, target: Sentence, opts: GradeOptions = {}): GradeResult {
  const a = normalise(answer);
  const t = normalise(target.zh);
  const attemptChunks = alignToChunks(answer, target);

  const exact = a === t || (target.alsoOk ?? []).some((alt) => normalise(alt) === a);
  if (exact) {
    return { verdict: 'correct', pass: true, diagnoses: [], attemptChunks };
  }

  if (a.length === 0) {
    const d: Diagnosis = {
      code: 'LEXIS.missing_word',
      prompt: 'Nothing to check yet — give it a try.',
    };
    return { verdict: 'error', pass: false, diagnoses: [d], attemptChunks };
  }

  const answerChunks = attemptChunks.map((c) => c.zh);
  const targetChunks = chunkStrings(target);

  // A known habit or a missing particle explains the difference on its own.
  const lexis = diagnoseLexis(answer, target);
  if (lexis.length > 0) {
    const only = lexis[0];
    // A single missing 了 on an otherwise perfect sentence is a minor issue: it
    // counts as correct, with the fix shown inline.
    const withoutParticle = t.replace(/[了吗]/g, '');
    if (only && only.code === 'PARTICLE.le_missing' && a === withoutParticle) {
      return {
        verdict: 'minor',
        pass: true,
        diagnoses: lexis,
        attemptChunks,
        minorNote: 'Add 了 to mark that it is finished.',
      };
    }
    return { verdict: 'error', pass: false, diagnoses: lexis, attemptChunks };
  }

  const missing = missingChunks(answerChunks, targetChunks);
  const extra = missingChunks(targetChunks, answerChunks);

  // Same pieces, wrong order.
  if (missing.length === 0 && extra.length === 0) {
    const order = diagnoseOrder(answerChunks, targetChunks, target);
    if (order.length > 0) return { verdict: 'error', pass: false, diagnoses: order, attemptChunks };
  }

  // Free composition: if the learner used the pattern's shape and nothing above
  // fired, accept it. The hosted grader will judge these properly.
  if (opts.loose && missing.length <= targetChunks.length - 2 && extra.length <= 2) {
    return { verdict: 'correct', pass: true, diagnoses: [], attemptChunks };
  }

  if (missing.length > 0) {
    const code: ErrorCode = 'LEXIS.missing_word';
    const chunk = missing[0];
    return {
      verdict: 'error',
      pass: false,
      diagnoses: [{ code, chunk, prompt: selfCorrectPrompt(code, chunk) }],
      attemptChunks,
    };
  }

  const code: ErrorCode = extra.length > 0 ? 'LEXIS.extra_word' : 'LEXIS.wrong_word';
  const chunk = extra[0];
  return {
    verdict: 'error',
    pass: false,
    diagnoses: [{ code, chunk, prompt: selfCorrectPrompt(code, chunk) }],
    attemptChunks,
  };
}

/** The live connector guard (§7): an opened pair with no second half yet. */
export function connectorGuard(text: string): { first: string; label: string; hindi: string } | null {
  const a = normalise(text);
  for (const [first, pair] of Object.entries(CONNECTOR_PAIRS)) {
    if (a.includes(first) && !a.includes(pair.second)) {
      return { first, label: pair.label, hindi: pair.hindi };
    }
  }
  return null;
}
