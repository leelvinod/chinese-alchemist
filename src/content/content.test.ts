/* Content integrity. The content team owns patterns.ts, vocab.ts and the rest;
   these tests are the contract that says what the app assumes about their data,
   so a bad row fails here rather than in front of a learner. */

import { describe, expect, it } from 'vitest';
import { CONNECTOR_PAIRS, PATTERNS, PATTERN_BY_ID } from './patterns';
import { VOCAB, exampleText } from './vocab';
import { MINIMAL_PAIRS, TONE_PAIRS } from './listening';
import { MINI_MODULES, PINYIN_FINALS, PINYIN_INITIALS } from './bridge';
import { PLACEMENT_ITEMS } from './placement';
import { MM_SLOT } from '../design/slots';
import { READINGS, readingOf } from './pinyin';
import { grade, normalise } from '../engine/grader';
import { DRILL_ORDER, blankIndex } from './types';

const HANZI = /^[㐀-鿿　-〿，。？！、]+$/;

describe('patterns', () => {
  it('has unique ids', () => {
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length);
  });

  it('has unique drill ids across every pattern', () => {
    const ids = PATTERNS.flatMap((p) => p.drills.map((d) => d.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only slots the colour system defines', () => {
    for (const p of PATTERNS) {
      for (const slot of p.skeleton) expect(MM_SLOT[slot]).toBeDefined();
      for (const ex of p.examples) for (const c of ex.chunks) expect(MM_SLOT[c.slot]).toBeDefined();
      for (const d of p.drills) for (const c of d.target.chunks) expect(MM_SLOT[c.slot]).toBeDefined();
    }
  });

  it('gives every pattern at least two worked examples for the detail screen', () => {
    for (const p of PATTERNS) expect(p.examples.length).toBeGreaterThanOrEqual(2);
  });

  it('gives every pattern a rule that reads as one sentence', () => {
    for (const p of PATTERNS) {
      expect(p.rule.length).toBeGreaterThan(10);
      expect(p.rule.endsWith('.')).toBe(true);
    }
  });

  it('names an error each pattern is meant to fix', () => {
    for (const p of PATTERNS) expect(p.targets.length).toBeGreaterThan(0);
  });

  it('keeps every sentence zh in step with its chunks', () => {
    for (const p of PATTERNS) {
      for (const s of [...p.examples, ...p.drills.map((d) => d.target)]) {
        expect(normalise(s.chunks.map((c) => c.zh).join(''))).toBe(normalise(s.zh));
      }
    }
  });

  it('writes every target sentence in hanzi, with no stray Latin', () => {
    for (const p of PATTERNS) {
      for (const s of [...p.examples, ...p.drills.map((d) => d.target)]) {
        expect(s.zh, `${p.id}: ${s.zh}`).toMatch(HANZI);
      }
    }
  });

  it('gives every chunk a pinyin reading', () => {
    for (const p of PATTERNS) {
      for (const s of [...p.examples, ...p.drills.map((d) => d.target)]) {
        for (const c of s.chunks) expect(c.py, `${p.id}: ${c.zh}`).toBeTruthy();
      }
    }
  });

  it('gives every drill an English prompt to show', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills) expect(d.target.en.length, `${p.id}/${d.id}`).toBeGreaterThan(3);
    }
  });

  it('gives every pattern a drill at the first ladder step it offers', () => {
    for (const p of PATTERNS) {
      const kinds = new Set(p.drills.map((d) => d.kind));
      expect([...kinds].some((k) => DRILL_ORDER.includes(k)), p.id).toBe(true);
    }
  });

  it('gives every pattern a spoken drill, since every session ends in one', () => {
    for (const p of PATTERNS) {
      expect(p.drills.some((d) => d.kind === 'sayit'), p.id).toBe(true);
    }
  });

  it('points every fill drill at a chunk the sentence actually has', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills.filter((x) => x.kind === 'fill')) {
        expect(d.blankSlot, d.id).toBeDefined();
        const i = blankIndex(d);
        expect(i, d.id).toBeGreaterThanOrEqual(0);
        expect(d.target.chunks[i], d.id).toBeDefined();
      }
    }
  });

  it('says which chunk is blanked when the slot appears more than once', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills.filter((x) => x.kind === 'fill')) {
        const repeats = d.target.chunks.filter((c) => c.slot === d.blankSlot).length;
        if (repeats > 1) expect(d.blankAt, `${d.id} has ${repeats} ${d.blankSlot} chunks`).toBeDefined();
      }
    }
  });

  it('gives every fill drill three chips, one of which is right', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills.filter((x) => x.kind === 'fill')) {
        expect(d.chips, d.id).toHaveLength(3);
        const answer = d.target.chunks[blankIndex(d)]?.zh;
        expect(d.chips, d.id).toContain(answer);
      }
    }
  });

  it('blanks a chunk whose slot matches the slot it names', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills.filter((x) => x.kind === 'fill')) {
        expect(d.target.chunks[blankIndex(d)]?.slot, d.id).toBe(d.blankSlot);
      }
    }
  });

  it('gives every transform drill a starting sentence and an instruction', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills.filter((x) => x.kind === 'transform')) {
        expect(d.from, d.id).toBeDefined();
        expect(d.ask, d.id).toBeTruthy();
        // Transforming into the same sentence would be a no-op drill.
        expect(normalise(d.from!.zh)).not.toBe(normalise(d.target.zh));
      }
    }
  });

  it('gives every join drill its two source clauses', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills.filter((x) => x.kind === 'join')) {
        expect(d.clauses, d.id).toHaveLength(2);
      }
    }
  });

  it('grades its own model answer as correct — every drill is winnable', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills) {
        const r = grade(d.target.zh, d.target);
        expect(r.verdict, `${d.id} should accept its own answer`).toBe('correct');
      }
    }
  });

  it('grades every listed alternative as correct too', () => {
    for (const p of PATTERNS) {
      for (const d of p.drills) {
        for (const alt of d.target.alsoOk ?? []) {
          expect(grade(alt, d.target).verdict, `${d.id}: ${alt}`).toBe('correct');
        }
      }
    }
  });

  it('writes transfer notes in plain English, one sentence each', () => {
    for (const p of PATTERNS) {
      if (!p.transfer) continue;
      expect(p.transfer.text.length).toBeGreaterThan(20);
      // The tone rule: never lecture, never "as you know from Hindi".
      expect(p.transfer.text.toLowerCase()).not.toContain('as you know');
    }
  });

  it('is indexed correctly by id', () => {
    for (const p of PATTERNS) expect(PATTERN_BY_ID[p.id]).toBe(p);
  });
});

describe('connector pairs', () => {
  it('names a second half, a Hindi pair and a ghost-slot label for each', () => {
    for (const [first, pair] of Object.entries(CONNECTOR_PAIRS)) {
      expect(first).toMatch(HANZI);
      expect(pair.second).toMatch(HANZI);
      expect(pair.hindi).toBeTruthy();
      expect(pair.label.startsWith('…')).toBe(true);
    }
  });
});

describe('vocabulary', () => {
  it('has unique ids', () => {
    expect(new Set(VOCAB.map((v) => v.id)).size).toBe(VOCAB.length);
  });

  it('marks the target word in every example with braces', () => {
    for (const w of VOCAB) {
      expect(w.example, w.id).toContain('{');
      expect(w.example, w.id).toContain('}');
    }
  });

  it('puts the braces around the word itself', () => {
    for (const w of VOCAB) {
      const inside = w.example.slice(w.example.indexOf('{') + 1, w.example.indexOf('}'));
      expect(inside, w.id).toBe(w.zh);
    }
  });

  it('strips cleanly to a readable sentence for TTS', () => {
    for (const w of VOCAB) {
      expect(exampleText(w), w.id).not.toContain('{');
      expect(exampleText(w), w.id).toContain(w.zh);
    }
  });

  it('gives every word a pinyin, a gloss and a translated example', () => {
    for (const w of VOCAB) {
      expect(w.py, w.id).toBeTruthy();
      expect(w.en, w.id).toBeTruthy();
      expect(w.examplePy, w.id).toBeTruthy();
      expect(w.exampleEn, w.id).toBeTruthy();
    }
  });

  it('stays inside HSK 1–4', () => {
    for (const w of VOCAB) expect([1, 2, 3, 4]).toContain(w.hsk);
  });

  it('includes HSK 1 words, so a beginner deck is never empty', () => {
    expect(VOCAB.some((w) => w.hsk === 1)).toBe(true);
  });
});

describe('listening content', () => {
  it('gives every tone-pair item two tones in 1–5', () => {
    for (const t of TONE_PAIRS) {
      expect(t.tones).toHaveLength(2);
      for (const n of t.tones) expect(n).toBeGreaterThanOrEqual(1);
      for (const n of t.tones) expect(n).toBeLessThanOrEqual(5);
    }
  });

  it('writes tone-pair words in hanzi only', () => {
    for (const t of TONE_PAIRS) expect(t.zh, t.py).toMatch(HANZI);
  });

  it('gives every tone-pair word two syllables of pinyin', () => {
    for (const t of TONE_PAIRS) expect([...t.zh].length, t.py).toBe(2);
  });

  it('gives every minimal pair two distinct options and an answer', () => {
    for (const m of MINIMAL_PAIRS) {
      expect(m.a.zh, m.id).not.toBe(m.b.zh);
      expect(['a', 'b'], m.id).toContain(m.answer);
      expect(m.contrast, m.id).toBeTruthy();
    }
  });

  it('has unique minimal-pair ids', () => {
    expect(new Set(MINIMAL_PAIRS.map((m) => m.id)).size).toBe(MINIMAL_PAIRS.length);
  });

  it('has at least ten minimal pairs, the length of one session', () => {
    expect(MINIMAL_PAIRS.length).toBeGreaterThanOrEqual(10);
  });
});

describe('pinyin primer', () => {
  it('marks a cell with no Devanagari equivalent as having no match', () => {
    for (const c of [...PINYIN_INITIALS, ...PINYIN_FINALS]) {
      if (c.deva === null) expect(c.accuracy, c.py).toBe('x');
    }
  });

  it('explains every cell that has no good Hindi equivalent', () => {
    for (const c of [...PINYIN_INITIALS, ...PINYIN_FINALS]) {
      if (c.accuracy === 'x') expect(c.note, c.py).toBeTruthy();
    }
  });

  it('flags the sounds the handoff calls out: j q x zh ch sh r ü e', () => {
    const noMatch = [...PINYIN_INITIALS, ...PINYIN_FINALS]
      .filter((c) => c.accuracy === 'x')
      .map((c) => c.py);
    for (const py of ['j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'ü', 'e']) {
      expect(noMatch, `${py} should be flagged`).toContain(py);
    }
  });

  it('has no duplicate cells', () => {
    const all = [...PINYIN_INITIALS, ...PINYIN_FINALS].map((c) => c.py);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('mini-modules', () => {
  it('gives every item a Chinese, pinyin, Hindi and English reading', () => {
    for (const m of MINI_MODULES) {
      for (const it of m.items) {
        expect(it.zh, m.id).toMatch(HANZI);
        expect(it.py, it.zh).toBeTruthy();
        expect(it.hindi, it.zh).toBeTruthy();
        expect(it.hindiDeva, it.zh).toBeTruthy();
        expect(it.en, it.zh).toBeTruthy();
      }
    }
  });

  it('has ten to fifteen items per module, as specified', () => {
    for (const m of MINI_MODULES) {
      expect(m.items.length, m.id).toBeGreaterThanOrEqual(6);
      expect(m.items.length, m.id).toBeLessThanOrEqual(15);
    }
  });

  it('renders kinship as a tree, not a list', () => {
    expect(MINI_MODULES.find((m) => m.id === 'kinship')?.kind).toBe('tree');
  });
});

describe('placement bank', () => {
  it('has unique ids', () => {
    expect(new Set(PLACEMENT_ITEMS.map((i) => i.id)).size).toBe(PLACEMENT_ITEMS.length);
  });

  it('covers all four HSK levels, so the test can adapt in both directions', () => {
    for (const lv of [1, 2, 3, 4]) {
      expect(PLACEMENT_ITEMS.some((i) => i.hsk === lv), `HSK ${lv}`).toBe(true);
    }
  });

  it('lists the right answer among the options of every choice item', () => {
    for (const i of PLACEMENT_ITEMS) {
      if (i.kind === 'meaning' || i.kind === 'listen') {
        expect(i.options, i.id).toBeDefined();
        expect(i.options, i.id).toContain(i.answer);
        expect(new Set(i.options).size, i.id).toBe(i.options!.length);
      }
    }
  });

  it('gives every reorder item tiles that build exactly its answer', () => {
    for (const i of PLACEMENT_ITEMS.filter((x) => x.kind === 'reorder')) {
      expect(i.tiles, i.id).toBeDefined();
      expect(normalise([...i.tiles!].sort().join('')), i.id).toBe(
        normalise([...(i.tiles ?? [])].sort().join('')),
      );
      expect(i.tiles!.join('').length, i.id).toBe(normalise(i.answer).length);
    }
  });

  it('writes spoken answers in hanzi, since the transcript is compared to them', () => {
    for (const i of PLACEMENT_ITEMS.filter((x) => x.kind === 'spoken')) {
      expect(i.answer, i.id).toMatch(HANZI);
    }
  });

  it('offers enough items to reach the minimum test length without repeating', () => {
    expect(PLACEMENT_ITEMS.length).toBeGreaterThanOrEqual(15);
  });
});

describe('character readings', () => {
  /** Every hanzi the learner can be shown, from every corner of the content. */
  const allHanzi = (): { ch: string; where: string }[] => {
    const out: { ch: string; where: string }[] = [];
    const add = (text: string, where: string) => {
      for (const ch of text) if (ch >= '\u4e00' && ch <= '\u9fff') out.push({ ch, where });
    };
    for (const p of PATTERNS) {
      for (const s of [...p.examples, ...p.drills.map((d) => d.target)]) add(s.zh, p.id);
      for (const d of p.drills) {
        for (const c of d.chips ?? []) add(c, d.id);
        for (const c of d.clauses ?? []) add(c, d.id);
        if (d.from) add(d.from.zh, d.id);
      }
    }
    for (const w of VOCAB) {
      add(w.zh, w.id);
      add(w.example, w.id);
      if (w.measure) add(w.measure, w.id);
    }
    for (const t of TONE_PAIRS) add(t.zh, t.py);
    for (const m of MINIMAL_PAIRS) {
      add(m.a.zh, m.id);
      add(m.b.zh, m.id);
    }
    for (const mod of MINI_MODULES) for (const it of mod.items) add(it.zh, mod.id);
    for (const i of PLACEMENT_ITEMS) {
      add(i.answer, i.id);
      for (const o of i.options ?? []) add(o, i.id);
      for (const t of i.tiles ?? []) add(t, i.id);
    }
    return out;
  };

  it('knows a reading for every character in the content', () => {
    const missing = [...new Map(allHanzi().filter((h) => !readingOf(h.ch)).map((h) => [h.ch, h])).values()];
    expect(missing.map((m) => `${m.ch} (${m.where})`)).toEqual([]);
  });

  it('gives every reading a toneless base and a tone in 1-5', () => {
    for (const [ch, r] of Object.entries(READINGS)) {
      expect(r.base, ch).toMatch(/^[a-z]+$/);
      expect(r.tone, ch).toBeGreaterThanOrEqual(1);
      expect(r.tone, ch).toBeLessThanOrEqual(5);
    }
  });
});
