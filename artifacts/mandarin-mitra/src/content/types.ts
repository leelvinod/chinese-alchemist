/* Mandarin Mitra — content types.
   The content team owns the data; the app owns the shapes. */

import type { SentenceChunk } from '../design/Sentence';
import type { SlotId } from '../design/slots';
import type { ErrorCode } from '../engine/errors';

export type HskLevel = 1 | 2 | 3 | 4;

/** The six-step ladder from §7 of the handoff, plus the P1 seventh. */
export type DrillKind = 'reorder' | 'fill' | 'transform' | 'translate' | 'build' | 'sayit' | 'join';

export const DRILL_ORDER: readonly DrillKind[] = [
  'reorder',
  'fill',
  'transform',
  'translate',
  'build',
  'sayit',
];

export const DRILL_LABEL: Record<DrillKind, string> = {
  reorder: 'Reorder tiles',
  fill: 'Fill the slot',
  transform: 'Transform',
  translate: 'Translate',
  build: 'Build freely',
  sayit: 'Say it',
  join: 'Join sentences',
};

export const DRILL_INSTRUCTION: Record<DrillKind, string> = {
  reorder: 'Put the words in Chinese order.',
  fill: 'Fill the missing slot.',
  transform: 'Change the sentence as asked.',
  translate: 'Say this in Chinese.',
  build: 'Build a sentence of your own.',
  sayit: 'Say this in Chinese. You have 8 seconds.',
  join: 'Join the two sentences into one.',
};

/** One target sentence, held as slot chunks so every drill can render it. */
export interface Sentence {
  /** The whole sentence in hanzi, no spaces. */
  zh: string;
  /** Slot-by-slot breakdown, in Chinese order. */
  chunks: SentenceChunk[];
  /** English gloss, used as the prompt in translate / say-it drills. */
  en: string;
  /** Alternative answers that also grade as correct. */
  alsoOk?: string[];
}

export interface DrillItem {
  id: string;
  kind: DrillKind;
  /** The sentence the learner is aiming at. */
  target: Sentence;
  /** reorder: extra tiles that do not belong (distractors). */
  distractors?: SentenceChunk[];
  /** fill: which slot is blanked out. */
  blankSlot?: SlotId;
  /** fill: index of the blanked chunk. Required when the slot appears more than
   *  once in the sentence (虽然 and 但是 are both manner), where the slot alone
   *  does not say which one is missing. */
  blankAt?: number;
  /** fill: three chips, one of them right. */
  chips?: string[];
  /** transform: the sentence shown greyed above the field. */
  from?: Sentence;
  /** transform / build: the one-line instruction. */
  ask?: string;
  /** join: the two source clauses. */
  clauses?: [string, string];
  /** A one-line rule for the model-answer card. */
  rule?: string;
}

export interface TransferNote {
  positive: boolean;
  /** One sentence. Plain English, Hindi in italics where quoted. */
  text: string;
}

export interface Pattern {
  id: string;
  /** Learner-facing name, e.g. "Time before the verb". */
  name: string;
  hsk: HskLevel;
  /** The rule in one sentence. */
  rule: string;
  /** The slot skeleton for the pattern. */
  skeleton: SlotId[];
  /** Two worked examples for the pattern detail screen. */
  examples: Sentence[];
  /** The Hindi alignment note, shown when the bridge is on. */
  transfer?: TransferNote;
  /** Errors this pattern is designed to catch. */
  targets: ErrorCode[];
  drills: DrillItem[];
}

export interface VocabWord {
  id: string;
  zh: string;
  py: string;
  en: string;
  hsk: HskLevel;
  /** Example sentence with the word wrapped in {braces}. */
  example: string;
  examplePy: string;
  exampleEn: string;
  measure?: string;
  collocation?: string;
  /** P1: separable verbs show their split form. */
  split?: string;
}

export interface TonePairItem {
  zh: string;
  py: string;
  en: string;
  /** Tone number per syllable; 5 is the neutral tone. */
  tones: [number, number];
}

export interface MinimalPairItem {
  id: string;
  /** The contrast set this item trains, e.g. '-n / -ng'. */
  contrast: string;
  a: { zh: string; py: string; en: string };
  b: { zh: string; py: string; en: string };
  /** Which one is played. */
  answer: 'a' | 'b';
  /** The Devanagari cue, shown when Hindi is on. */
  hindiHint?: string;
}

export interface PinyinCell {
  py: string;
  /** Devanagari approximation, or null where Hindi has no good equivalent. */
  deva: string | null;
  /** '' exact-ish · '≈' close · 'x' no match. */
  accuracy: '' | '≈' | 'x';
  note?: string;
}

export interface PlacementItem {
  id: string;
  kind: 'meaning' | 'listen' | 'reorder' | 'spoken';
  hsk: HskLevel;
  prompt: string;
  options?: string[];
  answer: string;
  /** reorder: the tiles, shuffled at render time. */
  tiles?: string[];
}

/** The chunk a fill drill blanks out. Index wins where the content team gave one;
 *  otherwise the first chunk in the named slot. -1 when neither resolves. */
export function blankIndex(drill: DrillItem): number {
  if (drill.blankAt !== undefined) return drill.blankAt;
  if (!drill.blankSlot) return -1;
  return drill.target.chunks.findIndex((c) => c.slot === drill.blankSlot);
}
