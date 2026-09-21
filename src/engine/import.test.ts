/* ON-11. Learners' exports are messy, so the parser has to be forgiving about
   shape and honest about what it could not read. */

import { describe, expect, it } from 'vitest';
import { detectDelimiter, isPinyin, parseWordList, splitRow, stripTones } from './import';

describe('splitRow', () => {
  it('splits plain fields', () => {
    expect(splitRow('明天,míngtiān,tomorrow', ',')).toEqual(['明天', 'míngtiān', 'tomorrow']);
  });

  it('keeps a quoted comma inside its field', () => {
    expect(splitRow('词典,cídiǎn,"dictionary, wordbook"', ',')).toEqual([
      '词典',
      'cídiǎn',
      'dictionary, wordbook',
    ]);
  });

  it('unescapes a doubled quote', () => {
    expect(splitRow('说,shuō,"to say ""hello"""', ',')).toEqual(['说', 'shuō', 'to say "hello"']);
  });

  it('splits on tabs when asked', () => {
    expect(splitRow('明天\tmíngtiān\ttomorrow', '\t')).toEqual(['明天', 'míngtiān', 'tomorrow']);
  });

  it('keeps empty trailing fields rather than dropping the column', () => {
    expect(splitRow('明天,,tomorrow', ',')).toHaveLength(3);
  });
});

describe('detectDelimiter', () => {
  it('picks tabs for an Anki export', () => {
    expect(detectDelimiter('明天\tmíngtiān\ttomorrow')).toBe('\t');
  });

  it('picks commas for a CSV', () => {
    expect(detectDelimiter('明天,míngtiān,tomorrow')).toBe(',');
  });

  it('ignores leading blank lines when deciding', () => {
    expect(detectDelimiter('\n\n明天\tmíngtiān\ttomorrow')).toBe('\t');
  });
});

describe('parseWordList', () => {
  it('reads a plain three-column list', () => {
    const r = parseWordList('邮票,yóupiào,stamp\n词典,cídiǎn,dictionary');
    expect(r.words).toHaveLength(2);
    expect(r.words[0]?.zh).toBe('邮票');
    expect(r.words[0]?.py).toBe('yóupiào');
    expect(r.words[0]?.en).toBe('stamp');
  });

  it('skips a header row', () => {
    const r = parseWordList('Hanzi,Pinyin,Meaning\n词典,cídiǎn,dictionary');
    expect(r.words).toHaveLength(1);
    expect(r.words[0]?.zh).toBe('词典');
  });

  it('does not mistake a data row for a header', () => {
    const r = parseWordList('词典,cídiǎn,dictionary');
    expect(r.words).toHaveLength(1);
  });

  it('finds the Chinese wherever the column sits', () => {
    const r = parseWordList('dictionary,词典,cídiǎn');
    expect(r.words[0]?.zh).toBe('词典');
    expect(r.words[0]?.py).toBe('cídiǎn');
  });

  it('copes with a list that has no pinyin at all', () => {
    const r = parseWordList('词典,dictionary');
    expect(r.words[0]?.zh).toBe('词典');
    expect(r.words[0]?.en).toBe('dictionary');
  });

  it('joins extra columns into the meaning rather than losing them', () => {
    const r = parseWordList('词典,cídiǎn,dictionary,wordbook');
    expect(r.words[0]?.en).toContain('dictionary');
    expect(r.words[0]?.en).toContain('wordbook');
  });

  it('reports a row with no Chinese instead of dropping it silently', () => {
    const r = parseWordList('词典,cídiǎn,dictionary\nnonsense,row,here');
    expect(r.words).toHaveLength(1);
    expect(r.skipped).toHaveLength(1);
    expect(r.skipped[0]?.line).toBe(2);
    expect(r.skipped[0]?.why).toMatch(/no Chinese/);
  });

  it('reports a row that is Chinese and nothing else', () => {
    const r = parseWordList('词典');
    expect(r.words).toHaveLength(0);
    expect(r.skipped[0]?.why).toMatch(/nothing but Chinese/);
  });

  it('ignores blank lines', () => {
    const r = parseWordList('邮票,yóupiào,stamp\n\n\n词典,cídiǎn,dictionary\n');
    expect(r.words).toHaveLength(2);
    expect(r.skipped).toHaveLength(0);
  });

  it('counts a word already in the built-in deck as a duplicate', () => {
    // 明天 ships with the app.
    const r = parseWordList('明天,míngtiān,tomorrow');
    expect(r.words).toHaveLength(0);
    expect(r.duplicates).toBe(1);
  });

  it('counts a word already imported as a duplicate', () => {
    const r = parseWordList('词典,cídiǎn,worth it', ['imp-词典']);
    expect(r.duplicates).toBe(1);
  });

  it('does not import the same word twice from one file', () => {
    const r = parseWordList('词典,cídiǎn,worth it\n词典,cídiǎn,worth it');
    expect(r.words).toHaveLength(1);
    expect(r.duplicates).toBe(1);
  });

  it('reads a tab-separated export', () => {
    const r = parseWordList('词典\tcídiǎn\tdictionary');
    expect(r.words[0]?.zh).toBe('词典');
  });

  it('gives every imported word the shape a review card needs', () => {
    const r = parseWordList('词典,cídiǎn,dictionary');
    const w = r.words[0]!;
    expect(w.id).toBe('imp-词典');
    expect(w.imported).toBe(true);
    expect(w.example).toContain('{词典}');
    expect(w.hsk).toBe(1);
  });

  it('returns nothing at all for an empty file rather than throwing', () => {
    const r = parseWordList('');
    expect(r.words).toHaveLength(0);
    expect(r.skipped).toHaveLength(0);
  });
});

describe('isPinyin', () => {
  it('accepts pinyin with tone marks, including the third tone', () => {
    for (const s of ['cídiǎn', 'míngtiān', 'nǐ hǎo', 'lǜ', 'zhōngwén', 'wǒ']) {
      expect(isPinyin(s), s).toBe(true);
    }
  });

  it('accepts numbered pinyin, the way some exports write it', () => {
    expect(isPinyin('ming2tian1')).toBe(true);
  });

  it('rejects English words that happen to be Latin letters', () => {
    for (const s of ['dictionary', 'tomorrow', 'stamp', 'worth it', 'hello', 'friend']) {
      expect(isPinyin(s), s).toBe(false);
    }
  });

  it('rejects an empty field', () => {
    expect(isPinyin('')).toBe(false);
    expect(isPinyin('   ')).toBe(false);
  });
});

describe('stripTones', () => {
  it('reduces every tone mark to its plain vowel', () => {
    expect(stripTones('míngtiān')).toBe('mingtian');
    expect(stripTones('nǐ hǎo')).toBe('ni hao');
    expect(stripTones('lǜ')).toBe('lv');
  });

  it('drops tone digits', () => {
    expect(stripTones('ming2')).toBe('ming');
  });
});
