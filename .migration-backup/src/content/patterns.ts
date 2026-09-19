/* Mandarin Mitra — grammar patterns, HSK 1–3.
   Each pattern carries its rule, skeleton, worked examples, the Hindi transfer
   note, and the drills that climb its six-step ladder. Launch content: eight
   patterns. The content team extends this file; nothing else has to change. */

import type { Pattern } from './types';

/* Chunk shorthand keeps the data readable. Hindi is optional per chunk: it is
   only filled in where the alignment is real, never invented to fill a gap. */
const wo = { slot: 'subject' as const, zh: '我', py: 'wǒ', roman: 'main', deva: 'मैं' };
const ta = { slot: 'subject' as const, zh: '他', py: 'tā', roman: 'vah', deva: 'वह' };
const mingtian = { slot: 'time' as const, zh: '明天', py: 'míngtiān', roman: 'kal', deva: 'कल' };
const zuotian = { slot: 'time' as const, zh: '昨天', py: 'zuótiān', roman: 'kal', deva: 'कल' };
const jintian = { slot: 'time' as const, zh: '今天', py: 'jīntiān', roman: 'aaj', deva: 'आज' };

export const PATTERNS: Pattern[] = [
  {
    id: 'time-before-verb',
    name: 'Time before the verb',
    hsk: 1,
    rule: 'In Chinese the time word comes before the verb, not after it.',
    skeleton: ['subject', 'time', 'verb', 'object'],
    targets: ['WORD_ORDER.time_after_verb'],
    transfer: {
      positive: true,
      text: 'Hindi agrees here: kal comes before the verb too, so the order carries straight over.',
    },
    examples: [
      {
        zh: '我明天去台北',
        en: "Tomorrow I'm going to Taipei.",
        chunks: [
          wo,
          mingtian,
          { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
        ],
      },
      {
        zh: '她今天学中文',
        en: 'She studies Chinese today.',
        chunks: [
          { slot: 'subject', zh: '她', py: 'tā', roman: 'vah', deva: 'वह' },
          jintian,
          { slot: 'verb', zh: '学', py: 'xué', roman: 'padhti hai', deva: 'पढ़ती है' },
          { slot: 'object', zh: '中文', py: 'Zhōngwén', roman: 'Chinese', deva: 'चीनी' },
        ],
      },
    ],
    drills: [
      {
        id: 'tbv-reorder-1',
        kind: 'reorder',
        rule: 'The time word sits after the subject and before the verb.',
        target: {
          zh: '我明天去台北',
          en: "Tomorrow I'm going to Taipei.",
          chunks: [
            wo,
            mingtian,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
      {
        id: 'tbv-fill-1',
        kind: 'fill',
        blankSlot: 'time',
        chips: ['明天', '去', '很'],
        rule: 'Time goes between the subject and the verb.',
        target: {
          zh: '我明天去台北',
          en: "Tomorrow I'm going to Taipei.",
          chunks: [
            wo,
            mingtian,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
      {
        id: 'tbv-transform-1',
        kind: 'transform',
        ask: 'Add tomorrow to this sentence.',
        rule: 'Nothing else moves — the time word slots in before the verb.',
        from: {
          zh: '我去台北',
          en: "I'm going to Taipei.",
          chunks: [
            wo,
            { slot: 'verb', zh: '去', py: 'qù' },
            { slot: 'object', zh: '台北', py: 'Táiběi' },
          ],
        },
        target: {
          zh: '我明天去台北',
          en: "Tomorrow I'm going to Taipei.",
          chunks: [
            wo,
            mingtian,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
      {
        id: 'tbv-translate-1',
        kind: 'translate',
        rule: 'Subject, then time, then verb.',
        target: {
          zh: '我昨天看电影',
          en: 'I watched a film yesterday.',
          alsoOk: ['我昨天看了电影'],
          chunks: [
            wo,
            zuotian,
            { slot: 'verb', zh: '看', py: 'kàn', roman: 'dekhi', deva: 'देखी' },
            { slot: 'object', zh: '电影', py: 'diànyǐng', roman: 'film', deva: 'फ़िल्म' },
          ],
        },
      },
      {
        id: 'tbv-build-1',
        kind: 'build',
        ask: 'Say what you are doing this weekend, using a time word.',
        rule: 'Any verb is fine. The time word just has to come before it.',
        target: {
          zh: '我这个周末在家看书',
          en: "This weekend I'm reading at home.",
          alsoOk: ['我周末在家看书', '我这个周末去公园'],
          chunks: [
            wo,
            { slot: 'time', zh: '这个周末', py: 'zhège zhōumò', roman: 'is weekend', deva: 'इस वीकेंड' },
            { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
            { slot: 'verb', zh: '看', py: 'kàn', roman: 'padhunga', deva: 'पढ़ूँगा' },
            { slot: 'object', zh: '书', py: 'shū', roman: 'kitaab', deva: 'किताब' },
          ],
        },
      },
      {
        id: 'tbv-sayit-1',
        kind: 'sayit',
        rule: 'Companion before place, time before both.',
        target: {
          zh: '我明天跟朋友去台北',
          en: "Tomorrow I'm going to Taipei with a friend.",
          chunks: [
            wo,
            mingtian,
            { slot: 'companion', zh: '跟朋友', py: 'gēn péngyou', roman: 'dost ke saath', deva: 'दोस्त के साथ' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
    ],
  },

  {
    id: 'place-before-verb',
    name: 'Place before the verb',
    hsk: 1,
    rule: 'Where something happens comes before the verb, marked with 在.',
    skeleton: ['subject', 'place', 'verb', 'object'],
    targets: ['WORD_ORDER.place_after_verb'],
    transfer: {
      positive: true,
      text: 'Just like ghar par in main ghar par khaana khaata hoon, 在家 comes before the verb.',
    },
    examples: [
      {
        zh: '我在家吃饭',
        en: 'I eat at home.',
        chunks: [
          wo,
          { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
          { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaata hoon', deva: 'खाता हूँ', swap: true },
          { slot: 'object', zh: '饭', py: 'fàn', roman: 'khaana', deva: 'खाना', swap: true },
        ],
      },
      {
        zh: '他在公司工作',
        en: 'He works at the company.',
        chunks: [
          ta,
          { slot: 'place', zh: '在公司', py: 'zài gōngsī', roman: 'company mein', deva: 'कंपनी में' },
          { slot: 'verb', zh: '工作', py: 'gōngzuò', roman: 'kaam karta hai', deva: 'काम करता है' },
        ],
      },
    ],
    drills: [
      {
        id: 'pbv-reorder-1',
        kind: 'reorder',
        rule: 'Place sits between the subject and the verb.',
        target: {
          zh: '我在家吃饭',
          en: 'I eat at home.',
          chunks: [
            wo,
            { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
            { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaata hoon', deva: 'खाता हूँ', swap: true },
            { slot: 'object', zh: '饭', py: 'fàn', roman: 'khaana', deva: 'खाना', swap: true },
          ],
        },
      },
      {
        id: 'pbv-fill-1',
        kind: 'fill',
        blankSlot: 'place',
        chips: ['在公司', '公司在', '在'],
        rule: '在 plus the place, all before the verb.',
        target: {
          zh: '他在公司工作',
          en: 'He works at the company.',
          chunks: [
            ta,
            { slot: 'place', zh: '在公司', py: 'zài gōngsī', roman: 'company mein', deva: 'कंपनी में' },
            { slot: 'verb', zh: '工作', py: 'gōngzuò', roman: 'kaam karta hai', deva: 'काम करता है' },
          ],
        },
      },
      {
        id: 'pbv-transform-1',
        kind: 'transform',
        ask: 'Add at home to this sentence.',
        rule: 'The place goes in front of the verb, not after the object.',
        from: {
          zh: '我看书',
          en: 'I read.',
          chunks: [
            wo,
            { slot: 'verb', zh: '看', py: 'kàn' },
            { slot: 'object', zh: '书', py: 'shū' },
          ],
        },
        target: {
          zh: '我在家看书',
          en: 'I read at home.',
          chunks: [
            wo,
            { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
            { slot: 'verb', zh: '看', py: 'kàn', roman: 'padhta hoon', deva: 'पढ़ता हूँ' },
            { slot: 'object', zh: '书', py: 'shū', roman: 'kitaab', deva: 'किताब' },
          ],
        },
      },
      {
        id: 'pbv-translate-1',
        kind: 'translate',
        rule: 'Time, then place, then verb.',
        target: {
          zh: '我今天在家工作',
          en: "Today I'm working at home.",
          chunks: [
            wo,
            jintian,
            { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
            { slot: 'verb', zh: '工作', py: 'gōngzuò', roman: 'kaam karunga', deva: 'काम करूँगा' },
          ],
        },
      },
      {
        id: 'pbv-sayit-1',
        kind: 'sayit',
        rule: 'Place before the verb, object after it.',
        target: {
          zh: '我在家吃饭',
          en: 'I eat at home.',
          chunks: [
            wo,
            { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
            { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaata hoon', deva: 'खाता हूँ' },
            { slot: 'object', zh: '饭', py: 'fàn', roman: 'khaana', deva: 'खाना' },
          ],
        },
      },
    ],
  },

  {
    id: 'hen-adjective',
    name: '很 before adjectives',
    hsk: 1,
    rule: 'An adjective is its own predicate: use 很, never 是.',
    skeleton: ['subject', 'manner', 'verb'],
    targets: ['COPULA.shi_before_adjective'],
    transfer: {
      positive: false,
      text: "In Hindi you'd say vah lamba hai. Chinese has no 是 before an adjective — say 他很高.",
    },
    examples: [
      {
        zh: '他很高',
        en: 'He is tall.',
        chunks: [
          ta,
          { slot: 'manner', zh: '很', py: 'hěn' },
          { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
        ],
      },
      {
        zh: '今天很热',
        en: 'It is hot today.',
        chunks: [
          jintian,
          { slot: 'manner', zh: '很', py: 'hěn' },
          { slot: 'verb', zh: '热', py: 'rè', roman: 'garmi', deva: 'गरम' },
        ],
      },
    ],
    drills: [
      {
        id: 'hen-reorder-1',
        kind: 'reorder',
        rule: '很 comes between the subject and the adjective.',
        target: {
          zh: '他很高',
          en: 'He is tall.',
          chunks: [
            ta,
            { slot: 'manner', zh: '很', py: 'hěn' },
            { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
          ],
        },
        distractors: [{ slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' }],
      },
      {
        id: 'hen-fill-1',
        kind: 'fill',
        blankSlot: 'manner',
        chips: ['很', '是', '在'],
        rule: 'Adjectives take 很, not 是.',
        target: {
          zh: '今天很热',
          en: 'It is hot today.',
          chunks: [
            jintian,
            { slot: 'manner', zh: '很', py: 'hěn' },
            { slot: 'verb', zh: '热', py: 'rè', roman: 'garam', deva: 'गरम' },
          ],
        },
      },
      {
        id: 'hen-transform-1',
        kind: 'transform',
        ask: 'Fix this sentence.',
        rule: '是 links two nouns. An adjective needs 很.',
        from: {
          zh: '我是累',
          en: '(wrong) I am tired.',
          chunks: [
            wo,
            { slot: 'verb', zh: '是', py: 'shì' },
            { slot: 'verb', zh: '累', py: 'lèi' },
          ],
        },
        target: {
          zh: '我很累',
          en: 'I am tired.',
          chunks: [
            wo,
            { slot: 'manner', zh: '很', py: 'hěn' },
            { slot: 'verb', zh: '累', py: 'lèi', roman: 'thaka', deva: 'थका' },
          ],
        },
      },
      {
        id: 'hen-translate-1',
        kind: 'translate',
        rule: 'No 是 before an adjective.',
        target: {
          zh: '他的中文很好',
          en: 'His Chinese is very good.',
          chunks: [
            { slot: 'subject', zh: '他的中文', py: 'tā de Zhōngwén', roman: 'uski Chinese', deva: 'उसकी चीनी' },
            { slot: 'manner', zh: '很', py: 'hěn' },
            { slot: 'verb', zh: '好', py: 'hǎo', roman: 'acchi', deva: 'अच्छी' },
          ],
        },
      },
      {
        id: 'hen-sayit-1',
        kind: 'sayit',
        rule: '很 carries the sentence where English and Hindi use a verb.',
        target: {
          zh: '我很累',
          en: 'I am tired.',
          chunks: [
            wo,
            { slot: 'manner', zh: '很', py: 'hěn' },
            { slot: 'verb', zh: '累', py: 'lèi', roman: 'thaka', deva: 'थका' },
          ],
        },
      },
    ],
  },

  {
    id: 'companion-order',
    name: 'Companion before the verb',
    hsk: 2,
    rule: 'Who you are with comes before the verb, with 跟 … 一起.',
    skeleton: ['subject', 'time', 'companion', 'manner', 'verb'],
    targets: ['WORD_ORDER.companion_after_verb'],
    transfer: {
      positive: true,
      text: 'Hindi puts it in the same place: dost ke saath comes before the verb, and so does 跟朋友.',
    },
    examples: [
      {
        zh: '我跟朋友一起去',
        en: 'I am going with a friend.',
        chunks: [
          wo,
          { slot: 'companion', zh: '跟朋友', py: 'gēn péngyou', roman: 'dost ke saath', deva: 'दोस्त के साथ' },
          { slot: 'manner', zh: '一起', py: 'yìqǐ', roman: 'saath', deva: 'साथ' },
          { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
        ],
      },
      {
        zh: '他跟同事一起吃饭',
        en: 'He eats with his colleagues.',
        chunks: [
          ta,
          { slot: 'companion', zh: '跟同事', py: 'gēn tóngshì', roman: 'sahkarmi ke saath', deva: 'सहकर्मी के साथ' },
          { slot: 'manner', zh: '一起', py: 'yìqǐ', roman: 'saath', deva: 'साथ' },
          { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaata hai', deva: 'खाता है' },
          { slot: 'object', zh: '饭', py: 'fàn', roman: 'khaana', deva: 'खाना' },
        ],
      },
    ],
    drills: [
      {
        id: 'comp-reorder-1',
        kind: 'reorder',
        rule: 'Companion, then 一起, then the verb.',
        target: {
          zh: '我跟朋友一起去',
          en: 'I am going with a friend.',
          chunks: [
            wo,
            { slot: 'companion', zh: '跟朋友', py: 'gēn péngyou', roman: 'dost ke saath', deva: 'दोस्त के साथ' },
            { slot: 'manner', zh: '一起', py: 'yìqǐ', roman: 'saath', deva: 'साथ' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          ],
        },
      },
      {
        id: 'comp-fill-1',
        kind: 'fill',
        blankSlot: 'companion',
        chips: ['跟朋友', '朋友跟', '和'],
        rule: '跟 plus the person, before the verb.',
        target: {
          zh: '我跟朋友一起去',
          en: 'I am going with a friend.',
          chunks: [
            wo,
            { slot: 'companion', zh: '跟朋友', py: 'gēn péngyou', roman: 'dost ke saath', deva: 'दोस्त के साथ' },
            { slot: 'manner', zh: '一起', py: 'yìqǐ', roman: 'saath', deva: 'साथ' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          ],
        },
      },
      {
        id: 'comp-transform-1',
        kind: 'transform',
        ask: 'Add with a friend to this sentence.',
        rule: 'Time first, then companion, then the verb.',
        from: {
          zh: '我明天去台北',
          en: "Tomorrow I'm going to Taipei.",
          chunks: [wo, mingtian, { slot: 'verb', zh: '去', py: 'qù' }, { slot: 'object', zh: '台北', py: 'Táiběi' }],
        },
        target: {
          zh: '我明天跟朋友去台北',
          en: "Tomorrow I'm going to Taipei with a friend.",
          alsoOk: ['我明天跟朋友一起去台北'],
          chunks: [
            wo,
            mingtian,
            { slot: 'companion', zh: '跟朋友', py: 'gēn péngyou', roman: 'dost ke saath', deva: 'दोस्त के साथ' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
      {
        id: 'comp-sayit-1',
        kind: 'sayit',
        rule: 'Companion before place, time before both.',
        target: {
          zh: '我明天跟朋友去台北',
          en: "Tomorrow I'm going to Taipei with a friend.",
          alsoOk: ['我明天跟朋友一起去台北'],
          chunks: [
            wo,
            mingtian,
            { slot: 'companion', zh: '跟朋友', py: 'gēn péngyou', roman: 'dost ke saath', deva: 'दोस्त के साथ' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
    ],
  },

  {
    id: 'le-completed',
    name: '了 for a completed action',
    hsk: 2,
    rule: '了 goes straight after the verb to mark that the action is finished.',
    skeleton: ['subject', 'verb', 'complement', 'object'],
    targets: ['PARTICLE.le_missing'],
    transfer: {
      positive: false,
      text: 'Hindi marks the past on the verb itself — khareedin. Chinese leaves the verb alone and adds 了 after it.',
    },
    examples: [
      {
        zh: '我买了三本书',
        en: 'I bought three books.',
        chunks: [
          wo,
          { slot: 'verb', zh: '买', py: 'mǎi', roman: 'khareedin', deva: 'खरीदीं' },
          { slot: 'complement', zh: '了', py: 'le' },
          { slot: 'object', zh: '三本书', py: 'sān běn shū', roman: 'teen kitaabein', deva: 'तीन किताबें' },
        ],
      },
      {
        zh: '他昨天来了',
        en: 'He came yesterday.',
        chunks: [
          ta,
          zuotian,
          { slot: 'verb', zh: '来', py: 'lái', roman: 'aaya', deva: 'आया' },
          { slot: 'complement', zh: '了', py: 'le' },
        ],
      },
    ],
    drills: [
      {
        id: 'le-reorder-1',
        kind: 'reorder',
        rule: '了 clings to the verb, before the object.',
        target: {
          zh: '我买了三本书',
          en: 'I bought three books.',
          chunks: [
            wo,
            { slot: 'verb', zh: '买', py: 'mǎi', roman: 'khareedin', deva: 'खरीदीं' },
            { slot: 'complement', zh: '了', py: 'le' },
            { slot: 'object', zh: '三本书', py: 'sān běn shū', roman: 'teen kitaabein', deva: 'तीन किताबें' },
          ],
        },
      },
      {
        id: 'le-transform-1',
        kind: 'transform',
        ask: 'Make this about yesterday.',
        rule: 'Add the time word, and mark the finished action with 了.',
        from: {
          zh: '他来',
          en: 'He comes.',
          chunks: [ta, { slot: 'verb', zh: '来', py: 'lái' }],
        },
        target: {
          zh: '他昨天来了',
          en: 'He came yesterday.',
          chunks: [
            ta,
            zuotian,
            { slot: 'verb', zh: '来', py: 'lái', roman: 'aaya', deva: 'आया' },
            { slot: 'complement', zh: '了', py: 'le' },
          ],
        },
      },
      {
        id: 'le-translate-1',
        kind: 'translate',
        rule: 'Verb, then 了, then the object.',
        target: {
          zh: '我吃了饭',
          en: 'I have eaten.',
          alsoOk: ['我吃饭了'],
          chunks: [
            wo,
            { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaaya', deva: 'खाया' },
            { slot: 'complement', zh: '了', py: 'le' },
            { slot: 'object', zh: '饭', py: 'fàn', roman: 'khaana', deva: 'खाना' },
          ],
        },
      },
      {
        id: 'le-sayit-1',
        kind: 'sayit',
        rule: '了 right after the verb.',
        target: {
          zh: '我昨天买了两本书',
          en: 'Yesterday I bought two books.',
          chunks: [
            wo,
            zuotian,
            { slot: 'verb', zh: '买', py: 'mǎi', roman: 'khareedin', deva: 'खरीदीं' },
            { slot: 'complement', zh: '了', py: 'le' },
            { slot: 'object', zh: '两本书', py: 'liǎng běn shū', roman: 'do kitaabein', deva: 'दो किताबें' },
          ],
        },
      },
    ],
  },

  {
    id: 'measure-words',
    name: 'Measure words',
    hsk: 2,
    rule: 'A number never touches a noun directly — a measure word sits between them.',
    skeleton: ['subject', 'verb', 'object'],
    targets: ['MEASURE.wrong_classifier', 'MEASURE.missing'],
    transfer: {
      positive: false,
      text: 'Hindi gets by with do bhai — no counter needed. Chinese picks one to match the noun: 两个哥哥.',
    },
    examples: [
      {
        zh: '我有两个哥哥',
        en: 'I have two older brothers.',
        chunks: [
          wo,
          { slot: 'verb', zh: '有', py: 'yǒu', roman: 'hain', deva: 'हैं' },
          { slot: 'object', zh: '两个哥哥', py: 'liǎng ge gēge', roman: 'do bhai', deva: 'दो भाई' },
        ],
      },
      {
        zh: '我买了三本书',
        en: 'I bought three books.',
        chunks: [
          wo,
          { slot: 'verb', zh: '买', py: 'mǎi', roman: 'khareedin', deva: 'खरीदीं' },
          { slot: 'complement', zh: '了', py: 'le' },
          { slot: 'object', zh: '三本书', py: 'sān běn shū', roman: 'teen kitaabein', deva: 'तीन किताबें' },
        ],
      },
    ],
    drills: [
      {
        id: 'mw-fill-1',
        kind: 'fill',
        blankSlot: 'object',
        chips: ['三本书', '三书', '三个书'],
        rule: '书 takes 本.',
        target: {
          zh: '我买了三本书',
          en: 'I bought three books.',
          chunks: [
            wo,
            { slot: 'verb', zh: '买', py: 'mǎi', roman: 'khareedin', deva: 'खरीदीं' },
            { slot: 'complement', zh: '了', py: 'le' },
            { slot: 'object', zh: '三本书', py: 'sān běn shū', roman: 'teen kitaabein', deva: 'तीन किताबें' },
          ],
        },
      },
      {
        id: 'mw-transform-1',
        kind: 'transform',
        ask: 'Make it three cups of tea.',
        rule: '杯 is the measure word for drinks in cups.',
        from: {
          zh: '我要一杯茶',
          en: 'I want a cup of tea.',
          chunks: [
            wo,
            { slot: 'verb', zh: '要', py: 'yào' },
            { slot: 'object', zh: '一杯茶', py: 'yì bēi chá' },
          ],
        },
        target: {
          zh: '我要三杯茶',
          en: 'I want three cups of tea.',
          chunks: [
            wo,
            { slot: 'verb', zh: '要', py: 'yào', roman: 'chahiye', deva: 'चाहिए' },
            { slot: 'object', zh: '三杯茶', py: 'sān bēi chá', roman: 'teen cup chai', deva: 'तीन कप चाय' },
          ],
        },
      },
      {
        id: 'mw-translate-1',
        kind: 'translate',
        rule: '哥哥 takes 个.',
        target: {
          zh: '我有两个哥哥',
          en: 'I have two older brothers.',
          chunks: [
            wo,
            { slot: 'verb', zh: '有', py: 'yǒu', roman: 'hain', deva: 'हैं' },
            { slot: 'object', zh: '两个哥哥', py: 'liǎng ge gēge', roman: 'do bhai', deva: 'दो भाई' },
          ],
        },
      },
      {
        id: 'mw-sayit-1',
        kind: 'sayit',
        rule: 'Number, measure word, noun — in that order.',
        target: {
          zh: '我有两个哥哥',
          en: 'I have two older brothers.',
          chunks: [
            wo,
            { slot: 'verb', zh: '有', py: 'yǒu', roman: 'hain', deva: 'हैं' },
            { slot: 'object', zh: '两个哥哥', py: 'liǎng ge gēge', roman: 'do bhai', deva: 'दो भाई' },
          ],
        },
      },
    ],
  },

  {
    id: 'de-complement',
    name: '得 for how you do it',
    hsk: 3,
    rule: 'To say how an action is done, add 得 after the verb and the description after 得.',
    skeleton: ['subject', 'verb', 'complement'],
    targets: ['PARTICLE.de_missing'],
    transfer: {
      positive: false,
      text: 'Hindi puts the description first — bahut tez bolta hai. Chinese puts it after the verb: 说得很快.',
    },
    examples: [
      {
        zh: '他说得很快',
        en: 'He speaks very fast.',
        chunks: [
          ta,
          { slot: 'verb', zh: '说', py: 'shuō', roman: 'bolta hai', deva: 'बोलता है', swap: true },
          { slot: 'complement', zh: '得很快', py: 'de hěn kuài', roman: 'bahut tez', deva: 'बहुत तेज़', swap: true },
        ],
      },
      {
        zh: '我写得不好',
        en: 'I write badly.',
        chunks: [
          wo,
          { slot: 'verb', zh: '写', py: 'xiě', roman: 'likhta hoon', deva: 'लिखता हूँ' },
          { slot: 'complement', zh: '得不好', py: 'de bù hǎo', roman: 'accha nahin', deva: 'अच्छा नहीं' },
        ],
      },
    ],
    drills: [
      {
        id: 'de-reorder-1',
        kind: 'reorder',
        rule: 'The description follows the verb, joined by 得.',
        target: {
          zh: '他说得很快',
          en: 'He speaks very fast.',
          chunks: [
            ta,
            { slot: 'verb', zh: '说', py: 'shuō', roman: 'bolta hai', deva: 'बोलता है' },
            { slot: 'complement', zh: '得很快', py: 'de hěn kuài', roman: 'bahut tez', deva: 'बहुत तेज़' },
          ],
        },
      },
      {
        id: 'de-transform-1',
        kind: 'transform',
        ask: 'Say that he speaks slowly instead.',
        rule: 'Only the description after 得 changes.',
        from: {
          zh: '他说得很快',
          en: 'He speaks very fast.',
          chunks: [ta, { slot: 'verb', zh: '说', py: 'shuō' }, { slot: 'complement', zh: '得很快', py: 'de hěn kuài' }],
        },
        target: {
          zh: '他说得很慢',
          en: 'He speaks very slowly.',
          chunks: [
            ta,
            { slot: 'verb', zh: '说', py: 'shuō', roman: 'bolta hai', deva: 'बोलता है' },
            { slot: 'complement', zh: '得很慢', py: 'de hěn màn', roman: 'bahut dheere', deva: 'बहुत धीरे' },
          ],
        },
      },
      {
        id: 'de-translate-1',
        kind: 'translate',
        rule: 'Verb, 得, then how.',
        target: {
          zh: '我写得不好',
          en: 'I write badly.',
          chunks: [
            wo,
            { slot: 'verb', zh: '写', py: 'xiě', roman: 'likhta hoon', deva: 'लिखता हूँ' },
            { slot: 'complement', zh: '得不好', py: 'de bù hǎo', roman: 'accha nahin', deva: 'अच्छा नहीं' },
          ],
        },
      },
      {
        id: 'de-sayit-1',
        kind: 'sayit',
        rule: 'Chinese puts the how after the verb.',
        target: {
          zh: '他中文说得很好',
          en: 'He speaks Chinese very well.',
          alsoOk: ['他说中文说得很好', '他的中文说得很好'],
          chunks: [
            ta,
            { slot: 'object', zh: '中文', py: 'Zhōngwén', roman: 'Chinese', deva: 'चीनी' },
            { slot: 'verb', zh: '说', py: 'shuō', roman: 'bolta hai', deva: 'बोलता है' },
            { slot: 'complement', zh: '得很好', py: 'de hěn hǎo', roman: 'bahut accha', deva: 'बहुत अच्छा' },
          ],
        },
      },
    ],
  },

  {
    id: 'suiran-danshi',
    name: 'Paired connectors (虽然…但是)',
    hsk: 3,
    rule: 'Chinese connectors come in pairs: if you open with 虽然, you must close with 但是.',
    skeleton: ['manner', 'subject', 'verb', 'manner', 'subject', 'verb'],
    targets: ['CONNECTOR.missing_second'],
    transfer: {
      positive: true,
      text: 'Hindi pairs them too: haalaanki … phir bhi. Keep the habit and Chinese works the same way.',
    },
    examples: [
      {
        zh: '虽然我很累，但是我还要工作',
        en: 'Although I am tired, I still have to work.',
        chunks: [
          { slot: 'manner', zh: '虽然', py: 'suīrán', roman: 'haalaanki', deva: 'हालाँकि' },
          wo,
          { slot: 'verb', zh: '很累', py: 'hěn lèi', roman: 'thaka hoon', deva: 'थका हूँ' },
          { slot: 'manner', zh: '但是', py: 'dànshì', roman: 'phir bhi', deva: 'फिर भी' },
          wo,
          { slot: 'verb', zh: '还要工作', py: 'hái yào gōngzuò', roman: 'kaam karna hai', deva: 'काम करना है' },
        ],
      },
      {
        zh: '因为下雨，所以我在家',
        en: 'Because it is raining, I am at home.',
        chunks: [
          { slot: 'manner', zh: '因为', py: 'yīnwèi', roman: 'kyunki', deva: 'क्योंकि' },
          { slot: 'verb', zh: '下雨', py: 'xià yǔ', roman: 'baarish ho rahi hai', deva: 'बारिश हो रही है' },
          { slot: 'manner', zh: '所以', py: 'suǒyǐ', roman: 'isliye', deva: 'इसलिए' },
          wo,
          { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
        ],
      },
    ],
    drills: [
      {
        id: 'sui-join-1',
        kind: 'join',
        clauses: ['我很累。', '我还要工作。'],
        ask: 'Join these with 虽然 … 但是.',
        rule: 'Both halves of the pair have to be there.',
        target: {
          zh: '虽然我很累，但是我还要工作',
          en: 'Although I am tired, I still have to work.',
          alsoOk: ['虽然我很累但是我还要工作'],
          chunks: [
            { slot: 'manner', zh: '虽然', py: 'suīrán', roman: 'haalaanki', deva: 'हालाँकि' },
            wo,
            { slot: 'verb', zh: '很累', py: 'hěn lèi', roman: 'thaka hoon', deva: 'थका हूँ' },
            { slot: 'manner', zh: '但是', py: 'dànshì', roman: 'phir bhi', deva: 'फिर भी' },
            wo,
            { slot: 'verb', zh: '还要工作', py: 'hái yào gōngzuò', roman: 'kaam karna hai', deva: 'काम करना है' },
          ],
        },
      },
      {
        id: 'sui-fill-1',
        kind: 'fill',
        blankSlot: 'manner',
        // Two manner chunks in this sentence; it is the second half that is missing.
        blankAt: 3,
        chips: ['但是', '因为', '所以'],
        rule: '虽然 always pairs with 但是.',
        target: {
          zh: '虽然我很累，但是我还要工作',
          en: 'Although I am tired, I still have to work.',
          chunks: [
            { slot: 'manner', zh: '虽然', py: 'suīrán', roman: 'haalaanki', deva: 'हालाँकि' },
            wo,
            { slot: 'verb', zh: '很累', py: 'hěn lèi', roman: 'thaka hoon', deva: 'थका हूँ' },
            { slot: 'manner', zh: '但是', py: 'dànshì', roman: 'phir bhi', deva: 'फिर भी' },
            wo,
            { slot: 'verb', zh: '还要工作', py: 'hái yào gōngzuò', roman: 'kaam karna hai', deva: 'काम करना है' },
          ],
        },
      },
      {
        id: 'sui-translate-1',
        kind: 'translate',
        rule: '因为 opens, 所以 closes.',
        target: {
          zh: '因为下雨，所以我在家',
          en: 'Because it is raining, I am at home.',
          alsoOk: ['因为下雨所以我在家'],
          chunks: [
            { slot: 'manner', zh: '因为', py: 'yīnwèi', roman: 'kyunki', deva: 'क्योंकि' },
            { slot: 'verb', zh: '下雨', py: 'xià yǔ', roman: 'baarish', deva: 'बारिश' },
            { slot: 'manner', zh: '所以', py: 'suǒyǐ', roman: 'isliye', deva: 'इसलिए' },
            wo,
            { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
          ],
        },
      },
      {
        id: 'sui-sayit-1',
        kind: 'sayit',
        rule: 'Do not drop the second half.',
        target: {
          zh: '虽然我很累，但是我还要工作',
          en: 'Although I am tired, I still have to work.',
          alsoOk: ['虽然我很累但是我还要工作'],
          chunks: [
            { slot: 'manner', zh: '虽然', py: 'suīrán', roman: 'haalaanki', deva: 'हालाँकि' },
            wo,
            { slot: 'verb', zh: '很累', py: 'hěn lèi', roman: 'thaka hoon', deva: 'थका हूँ' },
            { slot: 'manner', zh: '但是', py: 'dànshì', roman: 'phir bhi', deva: 'फिर भी' },
            wo,
            { slot: 'verb', zh: '还要工作', py: 'hái yào gōngzuò', roman: 'kaam karna hai', deva: 'काम करना है' },
          ],
        },
      },
    ],
  },
];

export const PATTERN_BY_ID: Record<string, Pattern> = Object.fromEntries(
  PATTERNS.map((p) => [p.id, p]),
);

/** Connector pairs the live guard watches for (§7 of the handoff). */
export const CONNECTOR_PAIRS: Record<string, { second: string; hindi: string; label: string }> = {
  虽然: { second: '但是', hindi: 'haalaanki … phir bhi', label: '…但是?' },
  如果: { second: '就', hindi: 'agar … to', label: '…就?' },
  因为: { second: '所以', hindi: 'kyunki … isliye', label: '…所以?' },
  不但: { second: '而且', hindi: 'na sirf … balki', label: '…而且?' },
  既然: { second: '就', hindi: 'jab … to', label: '…就?' },
};
