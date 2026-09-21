import { describe, expect, it } from 'vitest';
import { connectorGuard, grade, normalise } from './grader';
import { PATTERN_BY_ID } from '../content/patterns';
import type { Sentence } from '../content/types';

const target = (id: string, drillId: string): Sentence => {
  const p = PATTERN_BY_ID[id];
  const d = p?.drills.find((x) => x.id === drillId);
  if (!d) throw new Error(`missing drill ${drillId}`);
  return d.target;
};

const timeBeforeVerb = target('time-before-verb', 'tbv-reorder-1'); // 我明天去台北
const henAdj = target('hen-adjective', 'hen-transform-1'); // 我很累
const le = target('le-completed', 'le-translate-1'); // 我吃了饭
const mw = target('measure-words', 'mw-fill-1'); // 我买了三本书
const connector = target('suiran-danshi', 'sui-join-1');

describe('normalise', () => {
  it('drops punctuation and spaces so answers compare on characters alone', () => {
    expect(normalise('我明天去台北。')).toBe('我明天去台北');
    expect(normalise(' 虽然我很累，但是我还要工作 ')).toBe('虽然我很累但是我还要工作');
  });
});

describe('grade — correct answers', () => {
  it('accepts the exact target', () => {
    const r = grade('我明天去台北', timeBeforeVerb);
    expect(r.verdict).toBe('correct');
    expect(r.pass).toBe(true);
    expect(r.diagnoses).toHaveLength(0);
  });

  it('accepts the target with trailing punctuation', () => {
    expect(grade('我明天去台北。', timeBeforeVerb).verdict).toBe('correct');
  });

  it('accepts a listed alternative', () => {
    // 我吃饭了 is the alsoOk form of 我吃了饭
    expect(grade('我吃饭了', le).verdict).toBe('correct');
  });
});

describe('grade — word order', () => {
  it('flags the time word when it lands after the verb', () => {
    const r = grade('我去明天台北', timeBeforeVerb);
    expect(r.verdict).toBe('error');
    expect(r.pass).toBe(false);
    expect(r.diagnoses[0]?.code).toBe('WORD_ORDER.time_after_verb');
    expect(r.diagnoses[0]?.chunk).toBe('明天');
  });

  it('asks about the displaced chunk without giving the answer away', () => {
    const r = grade('我去明天台北', timeBeforeVerb);
    expect(r.diagnoses[0]?.prompt).toBe('Where does 明天 go?');
    // The prompt must not contain the model answer.
    expect(r.diagnoses[0]?.prompt).not.toContain('我明天去台北');
  });

  it('says where the chunk belongs, for the arrow in the feedback sheet', () => {
    const r = grade('我去明天台北', timeBeforeVerb);
    expect(r.diagnoses[0]?.belongsAt).toBe(1);
  });
});

describe('grade — the Hindi है habit', () => {
  it('flags 是 before an adjective', () => {
    const r = grade('我是累', henAdj);
    expect(r.diagnoses[0]?.code).toBe('COPULA.shi_before_adjective');
    expect(r.pass).toBe(false);
  });

  it('takes precedence over a plain missing-word diagnosis', () => {
    // 很 is missing too, but 是 is the error worth naming.
    const r = grade('我是很累', henAdj);
    expect(r.diagnoses[0]?.code).toBe('COPULA.shi_before_adjective');
  });
});

describe('grade — particles', () => {
  it('treats a lone missing 了 as a minor issue that still counts as correct', () => {
    const r = grade('我吃饭', le);
    expect(r.verdict).toBe('minor');
    expect(r.pass).toBe(true);
    expect(r.minorNote).toContain('了');
  });

  it('does not excuse a missing 了 when something else is wrong too', () => {
    const r = grade('我饭吃', le);
    expect(r.pass).toBe(false);
  });
});

describe('grade — measure words', () => {
  it('flags a missing measure word', () => {
    const r = grade('我买了三书', mw);
    expect(r.diagnoses[0]?.code).toBe('MEASURE.missing');
    expect(r.pass).toBe(false);
  });

  it('flags the wrong classifier', () => {
    const r = grade('我买了三个书', mw);
    expect(r.diagnoses[0]?.code).toBe('MEASURE.wrong_classifier');
  });
});

describe('grade — connectors', () => {
  it('flags an opened pair with no second half', () => {
    const r = grade('虽然我很累我还要工作', connector);
    expect(r.diagnoses[0]?.code).toBe('CONNECTOR.missing_second');
  });
});

describe('grade — empty and loose', () => {
  it('asks for an attempt rather than grading an empty answer', () => {
    const r = grade('', timeBeforeVerb);
    expect(r.pass).toBe(false);
    expect(r.diagnoses[0]?.prompt).toContain('give it a try');
  });

  it('accepts a free composition that uses the pattern and breaks no rule', () => {
    const build = target('time-before-verb', 'tbv-build-1');
    const r = grade('我这个周末在家看书', build, { loose: true });
    expect(r.verdict).toBe('correct');
  });

  it('still flags a known habit under loose grading', () => {
    const r = grade('我是累', henAdj, { loose: true });
    expect(r.diagnoses[0]?.code).toBe('COPULA.shi_before_adjective');
  });
});

describe('alignToChunks', () => {
  it('keeps the learner order so the attempt line shows what they wrote', () => {
    const r = grade('我去明天台北', timeBeforeVerb);
    expect(r.attemptChunks.map((c) => c.zh)).toEqual(['我', '去', '明天', '台北']);
  });

  it('surfaces characters the target does not contain rather than dropping them', () => {
    const r = grade('我明天去台北吗', timeBeforeVerb);
    expect(r.attemptChunks.map((c) => c.zh)).toContain('吗');
  });
});

describe('connectorGuard', () => {
  it('fires while the second half is still missing', () => {
    expect(connectorGuard('虽然我很累')?.label).toBe('…但是?');
  });

  it('carries the Hindi pair for the tap-through', () => {
    expect(connectorGuard('虽然我很累')?.hindi).toBe('haalaanki … phir bhi');
  });

  it('stops firing once the pair is complete', () => {
    expect(connectorGuard('虽然我很累，但是我还要工作')).toBeNull();
  });

  it('stays quiet on a sentence with no connector', () => {
    expect(connectorGuard('我明天去台北')).toBeNull();
  });
});

describe('grade — loose grading still enforces order', () => {
  const sayit = target('time-before-verb', 'tbv-sayit-1'); // 我明天跟朋友去台北

  it('does not accept the time word after the verb just because a word is missing', () => {
    // The learner dropped 跟朋友 and put 明天 after 去. Forgiving the dropped
    // word is fine; forgiving the order would teach the error.
    const r = grade('我去明天台北', sayit, { loose: true });
    expect(r.pass).toBe(false);
    expect(r.diagnoses[0]?.code).toBe('WORD_ORDER.time_after_verb');
  });

  it('still forgives a dropped word when the order is right', () => {
    const r = grade('我明天去台北', sayit, { loose: true });
    expect(r.verdict).toBe('correct');
  });

  it('accepts the full sentence', () => {
    expect(grade('我明天跟朋友去台北', sayit, { loose: true }).verdict).toBe('correct');
  });

  it('checks order on a spoken answer too', () => {
    const r = grade('我去明天台北', sayit, { loose: true, spoken: true });
    expect(r.pass).toBe(false);
  });

  it('says nothing about order when only one known chunk was used', () => {
    const r = grade('我', sayit, { loose: true });
    expect(r.diagnoses[0]?.code).not.toMatch(/^WORD_ORDER/);
  });
});
