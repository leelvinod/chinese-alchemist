/* Coarse pronunciation feedback: the sounds were right, the tone or one phoneme
   was not. This is the MVP's whole tone story — one syllable, one contour. */

import { describe, expect, it } from 'vitest';
import { grade, withTone } from './grader';
import { fullyReadable, readingsOf, soundDiff, splitSyllable } from '../content/pinyin';
import type { Sentence } from '../content/types';

const sentence = (zh: string, en = 'x'): Sentence => ({ zh, en, chunks: [] });

describe('splitSyllable', () => {
  it('keeps the two-letter retroflex initials together', () => {
    expect(splitSyllable('zhong')).toEqual({ initial: 'zh', final: 'ong' });
    expect(splitSyllable('chi')).toEqual({ initial: 'ch', final: 'i' });
    expect(splitSyllable('shi')).toEqual({ initial: 'sh', final: 'i' });
  });

  it('splits a single-letter initial from its final', () => {
    expect(splitSyllable('ming')).toEqual({ initial: 'm', final: 'ing' });
    expect(splitSyllable('tian')).toEqual({ initial: 't', final: 'ian' });
  });

  it('leaves a syllable with no initial alone', () => {
    expect(splitSyllable('an')).toEqual({ initial: '', final: 'an' });
  });
});

describe('soundDiff', () => {
  it('sees no difference between a syllable and itself', () => {
    expect(soundDiff('ming', 'ming')).toBeNull();
  });

  it('names the -n / -ng swap, the Hindi bindu habit', () => {
    expect(soundDiff('min', 'ming')).toBe('nasal');
    expect(soundDiff('xing', 'xin')).toBe('nasal');
  });

  it('names an aspiration slip', () => {
    expect(soundDiff('bai', 'pai')).toBe('aspiration');
    expect(soundDiff('da', 'ta')).toBe('aspiration');
    expect(soundDiff('gao', 'kao')).toBe('aspiration');
  });

  it('names a retroflex slip', () => {
    expect(soundDiff('zhai', 'zai')).toBe('retroflex');
    expect(soundDiff('shi', 'si')).toBe('retroflex');
  });

  it('calls anything else other, rather than guessing', () => {
    expect(soundDiff('wo', 'ni')).toBe('other');
  });
});

describe('withTone', () => {
  it('writes the mark on the vowel that carries it', () => {
    expect(withTone('ming', 2)).toBe('míng');
    expect(withTone('hao', 3)).toBe('hǎo');
    expect(withTone('qu', 4)).toBe('qù');
  });

  it('renders the ü diacritics the type test calls for', () => {
    expect(withTone('lv', 4)).toBe('lǜ');
    expect(withTone('lv', 3)).toBe('lǚ');
  });
});

describe('readings', () => {
  it('reads a whole sentence character by character', () => {
    expect(readingsOf('我明天').map((r) => r.base)).toEqual(['wo', 'ming', 'tian']);
  });

  it('reports a string it cannot fully read', () => {
    expect(fullyReadable('我明天')).toBe(true);
    expect(fullyReadable('我鬱天')).toBe(false);
  });

  it('ignores non-hanzi when judging readability', () => {
    expect(fullyReadable('我明天。')).toBe(true);
  });
});

describe('grade — spoken answers', () => {
  const target = sentence('我知道', 'I know');

  it('treats a right-sound wrong-tone answer as a tone error, not a wrong word', () => {
    // 值 zhí for 知 zhī — same syllable, second tone instead of first.
    const r = grade('我值道', target, { spoken: true });
    expect(r.diagnoses[0]?.code).toBe('TONE.wrong_tone');
    expect(r.pass).toBe(false);
  });

  it('names the syllable and the tone that was wanted', () => {
    const r = grade('我值道', target, { spoken: true });
    const s = r.diagnoses[0]?.sound;
    expect(s?.wantZh).toBe('知');
    expect(s?.wantPy).toBe('zhī');
    expect(s?.gotPy).toBe('zhí');
    expect(s?.wantTone).toBe(1);
    expect(s?.gotTone).toBe(2);
  });

  it('calls the same slip a wrong word when it was typed, not spoken', () => {
    const r = grade('我值道', target);
    expect(r.diagnoses[0]?.code).not.toBe('TONE.wrong_tone');
  });

  it('names an -n / -ng slip as a nasal ending', () => {
    // 人民 rénmín heard as 人名 rénmíng.
    const r = grade('人名', sentence('人民', 'the people'), { spoken: true });
    expect(r.diagnoses[0]?.code).toBe('PHONEME.nasal_final_drop');
    expect(r.diagnoses[0]?.sound?.wantPy).toBe('mín');
  });

  it('names an aspiration slip', () => {
    // 白 bái heard as 拍 pāi.
    const r = grade('拍', sentence('白', 'white'), { spoken: true });
    expect(r.diagnoses[0]?.code).toBe('PHONEME.aspiration');
  });

  it('names a retroflex slip', () => {
    // 摘 zhāi heard as 在 zài is not the same final; 知 zhī against 四 sì is not
    // either. Use the pair the content actually trains: 是 shì / 四 sì.
    const r = grade('四', sentence('是', 'to be'), { spoken: true });
    expect(r.diagnoses[0]?.code).toBe('PHONEME.retroflex');
  });

  it('still accepts a spoken answer that is simply right', () => {
    expect(grade('我知道', target, { spoken: true }).verdict).toBe('correct');
  });

  it('falls back to the structural diagnosis when the answer is a different length', () => {
    const r = grade('我知', target, { spoken: true });
    expect(r.diagnoses[0]?.code).not.toBe('TONE.wrong_tone');
  });

  it('does not invent a tone error for a genuinely different word', () => {
    const r = grade('我看道', target, { spoken: true });
    expect(r.diagnoses[0]?.code).not.toBe('TONE.wrong_tone');
  });

  it('never claims a sound problem it cannot read', () => {
    const r = grade('我鬱道', target, { spoken: true });
    expect(r.diagnoses[0]?.sound).toBeUndefined();
  });
});
