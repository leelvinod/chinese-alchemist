/* Mandarin Mitra — the error taxonomy.
   Internal codes never reach the learner: PR-01 and PR-02 show the plain-English
   name from ERROR_NAME. The full 44-type mapping comes from the content team;
   this is the launch subset plus the transfer notes that go with them. */

export type ErrorCode =
  | 'WORD_ORDER.time_after_verb'
  | 'WORD_ORDER.place_after_verb'
  | 'WORD_ORDER.companion_after_verb'
  | 'WORD_ORDER.manner_misplaced'
  | 'WORD_ORDER.object_before_verb'
  | 'CONNECTOR.missing_second'
  | 'COPULA.shi_before_adjective'
  | 'COPULA.missing_shi'
  | 'PARTICLE.le_missing'
  | 'PARTICLE.de_missing'
  | 'PARTICLE.ma_missing'
  | 'MEASURE.wrong_classifier'
  | 'MEASURE.missing'
  | 'NEGATION.wrong_negator'
  | 'PHONEME.nasal_final_drop'
  | 'PHONEME.aspiration'
  | 'PHONEME.retroflex'
  | 'TONE.wrong_tone'
  | 'LEXIS.wrong_word'
  | 'LEXIS.missing_word'
  | 'LEXIS.extra_word';

export const ERROR_NAME: Record<ErrorCode, string> = {
  'WORD_ORDER.time_after_verb': 'Time words after the verb',
  'WORD_ORDER.place_after_verb': 'Place after the verb',
  'WORD_ORDER.companion_after_verb': 'Companion after the verb',
  'WORD_ORDER.manner_misplaced': 'Adverb in the wrong place',
  'WORD_ORDER.object_before_verb': 'Object before the verb',
  'CONNECTOR.missing_second': 'Missing the second half of a pair (虽然…但是)',
  'COPULA.shi_before_adjective': '是 before adjectives',
  'COPULA.missing_shi': 'Missing 是 with a noun',
  'PARTICLE.le_missing': 'Missing 了 for a change or completed action',
  'PARTICLE.de_missing': 'Missing 的',
  'PARTICLE.ma_missing': 'Missing 吗 in a question',
  'MEASURE.wrong_classifier': 'Wrong measure word',
  'MEASURE.missing': 'Missing measure word',
  'NEGATION.wrong_negator': '不 where 没 belongs',
  'PHONEME.nasal_final_drop': 'Dropping -n / -ng endings',
  'PHONEME.aspiration': 'Aspiration (b/p, d/t, g/k)',
  'PHONEME.retroflex': 'Retroflex sounds (zh, ch, sh, r)',
  'TONE.wrong_tone': 'Tones',
  'LEXIS.wrong_word': 'Wrong word',
  'LEXIS.missing_word': 'Missing a word',
  'LEXIS.extra_word': 'An extra word',
};

/** Shown in PR-02 when the error is a Hindi transfer habit. */
export const ERROR_HINDI_NOTE: Partial<Record<ErrorCode, string>> = {
  'WORD_ORDER.time_after_verb':
    'Hindi agrees with Chinese here — kal aata hai, 明天来. English is the odd one out, and it is usually English pulling the time word to the end.',
  'WORD_ORDER.object_before_verb':
    "Hindi's habit: khaana khaata hai puts the object first. Chinese puts the verb first — 吃饭.",
  'COPULA.shi_before_adjective':
    "Hindi's है habit. vah lamba hai has a verb, so 他是高 feels right. Chinese uses 很, not 是, before an adjective.",
  'PHONEME.nasal_final_drop':
    'Hindi marks nasals with a bindu rather than a final consonant, so -n and -ng blur together.',
  'PHONEME.aspiration':
    'Hindi has the contrast English lacks: प/फ, त/थ, क/ख. Use it — b/p, d/t, g/k work the same way.',
  'PHONEME.retroflex':
    'Hindi retroflexes ट ठ ड are made further back than Chinese zh ch sh. Pull the tongue slightly forward.',
  'CONNECTOR.missing_second':
    'Hindi pairs them too: haalaanki…phir bhi. Chinese needs the second half just as much.',
  'MEASURE.wrong_classifier':
    'Hindi gets by with one all-purpose counter. Chinese picks a measure word to match the noun.',
};

/** Error families, used to group the top-5 rows on PR-01. */
export function errorFamily(code: ErrorCode): string {
  const dot = code.indexOf('.');
  return dot === -1 ? code : code.slice(0, dot);
}

export const FAMILY_NAME: Record<string, string> = {
  WORD_ORDER: 'Word order',
  CONNECTOR: 'Connectors',
  COPULA: 'Copula',
  PARTICLE: 'Particles',
  MEASURE: 'Measure words',
  NEGATION: 'Negation',
  PHONEME: 'Pronunciation',
  TONE: 'Tones',
  LEXIS: 'Word choice',
};

/** The one-line self-correct prompt for FB-01. Never gives the answer away. */
export function selfCorrectPrompt(code: ErrorCode, chunk?: string): string {
  switch (code) {
    case 'WORD_ORDER.time_after_verb':
    case 'WORD_ORDER.place_after_verb':
    case 'WORD_ORDER.companion_after_verb':
    case 'WORD_ORDER.manner_misplaced':
    case 'WORD_ORDER.object_before_verb':
      return chunk ? `Where does ${chunk} go?` : 'One piece is in the wrong place. Which one?';
    case 'CONNECTOR.missing_second':
      return 'This pair needs its second half. What comes next?';
    case 'COPULA.shi_before_adjective':
      return 'Chinese does not use 是 here. What goes before the adjective?';
    case 'COPULA.missing_shi':
      return 'Something is missing between the two nouns.';
    case 'PARTICLE.le_missing':
      return 'This already happened. What marks that?';
    case 'PARTICLE.de_missing':
      return 'One small particle is missing.';
    case 'PARTICLE.ma_missing':
      return 'This is a question. What turns it into one?';
    case 'MEASURE.wrong_classifier':
    case 'MEASURE.missing':
      return 'Check the measure word between the number and the noun.';
    case 'NEGATION.wrong_negator':
      return 'Which negator does this sentence need?';
    case 'LEXIS.missing_word':
      return chunk ? `Something is missing near ${chunk}.` : 'One word is missing.';
    case 'LEXIS.extra_word':
      return chunk ? `Is ${chunk} needed here?` : 'One word does not belong.';
    case 'LEXIS.wrong_word':
      return 'One word is not the one you want.';
    case 'PHONEME.nasal_final_drop':
      return 'Listen to the ending again — -n or -ng?';
    case 'PHONEME.aspiration':
      return 'Try that initial again, with more breath.';
    case 'PHONEME.retroflex':
      return 'Try that sound again, tongue a little further forward.';
    case 'TONE.wrong_tone':
      return 'One syllable drifted. Try the tones again.';
    default:
      return 'Almost. Have another look.';
  }
}
