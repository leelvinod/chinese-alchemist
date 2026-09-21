/* Mandarin Mitra — ON-11, importing a word list.
   The spec asks for Anki .apkg or CSV, reached from Me rather than forced into
   onboarding. .apkg is a zipped SQLite database, which is not worth carrying a
   decoder for in this version, so CSV and TSV are what this reads — and that is
   what Anki exports from File to Export anyway.

   Parsing is forgiving because the files are not: a learner's export may have a
   header or not, quoted fields, an extra column of tags, or a pinyin column in
   the middle. Anything unreadable is reported rather than dropped silently. */

import type { HskLevel, VocabWord } from '../content/types';
import { VOCAB } from '../content/vocab';

export interface ImportedWord extends VocabWord {
  /** Marks the word as the learner's own, not from the content team. */
  imported: true;
}

export interface ImportReport {
  words: ImportedWord[];
  /** Rows that could not be read, with the line number the learner can look at. */
  skipped: { line: number; text: string; why: string }[];
  /** Words already in the deck, which are left alone. */
  duplicates: number;
}

/** Split one CSV line, honouring double quotes and escaped quotes. */
export function splitRow(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((f) => f.trim());
}

/** Tabs beat commas when a line has more of them — Anki exports TSV by default. */
export function detectDelimiter(text: string): string {
  const line = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? '';
  const tabs = (line.match(/\t/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return tabs > commas ? '\t' : ',';
}

const hasHanzi = (s: string) => [...s].some((c) => c >= '一' && c <= '鿿');

/* Telling a pinyin column from an English one matters, because a learner's
   export may put them in either order. "Latin letters" is not enough — it
   matches "dictionary" too — so a field counts as pinyin only if it reads as a
   sequence of real pinyin syllables. That also catches the third-tone marks
   (ǎ ǐ ǒ ǔ ǚ), which sit in Latin Extended-B and a character range easily misses. */

const TONE_MARKED = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹ';
// ü family maps to v, which is how the syllable pattern below spells it.
const TONE_PLAIN = 'aaaaeeeeiiiioooouuuuvvvvvnnn';

/** Strip tone marks and tone digits, leaving bare syllables. */
export function stripTones(s: string): string {
  let out = '';
  for (const ch of s.toLowerCase()) {
    const i = TONE_MARKED.indexOf(ch);
    out += i >= 0 ? (TONE_PLAIN[i] ?? ch) : ch;
  }
  return out.replace(/[0-9]/g, '');
}

const INITIAL = '(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])';
const FINAL =
  '(?:iang|iong|uang|ueng|ang|eng|ing|ong|ian|iao|uai|uan|van|iu|ie|ia|in|un|ui|uo|ua|ue|ve|vn|er|ai|ei|ao|ou|an|en|a|o|e|i|u|v)';
const SYLLABLE = new RegExp('^' + INITIAL + '?' + FINAL + 'r?');

/** True when the whole string reads as pinyin syllables and nothing else. */
export function isPinyin(raw: string): boolean {
  const s = stripTones(raw).replace(/[\s'·-]/g, '');
  if (s.length === 0 || !/^[a-z]+$/.test(s)) return false;
  let rest = s;
  let guard = 0;
  while (rest.length > 0 && guard++ < 24) {
    const m = SYLLABLE.exec(rest);
    if (!m || m[0].length === 0) return false;
    rest = rest.slice(m[0].length);
  }
  return rest.length === 0;
}

const looksLikePinyin = (s: string) => isPinyin(s);

/** A header row names its columns rather than holding data. */
function isHeader(fields: string[]): boolean {
  const joined = fields.join(' ').toLowerCase();
  return !fields.some(hasHanzi) && /(hanzi|chinese|simplified|word|front|pinyin|meaning|english|back)/.test(joined);
}

/** Read a row into a word. The Chinese column is whichever holds hanzi; the rest
 *  are assigned by what they look like, so column order does not have to match. */
function readRow(fields: string[]): { word: Omit<VocabWord, 'id'> } | { why: string } {
  const zhIndex = fields.findIndex(hasHanzi);
  if (zhIndex === -1) return { why: 'no Chinese in this row' };

  const zh = fields[zhIndex] ?? '';
  const rest = fields.filter((_, i) => i !== zhIndex).filter((f) => f.length > 0);

  const pyIndex = rest.findIndex(looksLikePinyin);
  const py = pyIndex >= 0 ? (rest[pyIndex] ?? '') : '';
  const en = rest.filter((_, i) => i !== pyIndex).join('; ');

  if (!en && !py) return { why: 'nothing but Chinese in this row' };

  return {
    word: {
      zh,
      py,
      en: en || py,
      // An imported word has no level of its own; HSK 1 keeps it in reach of
      // every learner rather than hiding it behind a level they have not met.
      hsk: 1 as HskLevel,
      example: `{${zh}}`,
      examplePy: py,
      exampleEn: en || py,
    },
  };
}

export function parseWordList(text: string, existingIds: readonly string[] = []): ImportReport {
  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/);
  const words: ImportedWord[] = [];
  const skipped: ImportReport['skipped'] = [];
  let duplicates = 0;

  const seen = new Set(existingIds);
  const known = new Set(VOCAB.map((v) => v.zh));

  lines.forEach((line, i) => {
    if (line.trim().length === 0) return;
    const fields = splitRow(line, delimiter);
    if (i === 0 && isHeader(fields)) return;

    const read = readRow(fields);
    if ('why' in read) {
      skipped.push({ line: i + 1, text: line.slice(0, 60), why: read.why });
      return;
    }

    const id = `imp-${read.word.zh}`;
    if (seen.has(id) || known.has(read.word.zh)) {
      duplicates++;
      return;
    }
    seen.add(id);
    words.push({ id, ...read.word, imported: true });
  });

  return { words, skipped, duplicates };
}
