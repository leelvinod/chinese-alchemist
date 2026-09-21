/* HSK 1 patterns. The first things a learner meets, and the order the whole
   language hangs off: subject, then when, then where, then the verb. */

import type { Pattern } from '../types';
import { hen, jintian, mingtian, ni, ta, taF, wo, zuotian } from './shared';

export const HSK1: Pattern[] = [
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
          hen,
          { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
        ],
      },
      {
        zh: '今天很热',
        en: 'It is hot today.',
        chunks: [
          jintian,
          hen,
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
            hen,
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
            hen,
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
            hen,
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
            hen,
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
            hen,
            { slot: 'verb', zh: '累', py: 'lèi', roman: 'thaka', deva: 'थका' },
          ],
        },
      },
    ],
  },

  {
    id: 'shi-noun',
    name: '是 between two nouns',
    hsk: 1,
    rule: '是 links a noun to a noun — and only to a noun.',
    skeleton: ['subject', 'verb', 'object'],
    targets: ['COPULA.missing_shi'],
    transfer: {
      positive: true,
      text: 'This is the one place Hindi है carries straight over: main student hoon, 我是学生.',
    },
    examples: [
      {
        zh: '我是学生',
        en: 'I am a student.',
        chunks: [
          wo,
          { slot: 'verb', zh: '是', py: 'shì', roman: 'hoon', deva: 'हूँ' },
          { slot: 'object', zh: '学生', py: 'xuésheng', roman: 'student', deva: 'छात्र' },
        ],
      },
      {
        zh: '他是老师',
        en: 'He is a teacher.',
        chunks: [
          ta,
          { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
          { slot: 'object', zh: '老师', py: 'lǎoshī', roman: 'teacher', deva: 'शिक्षक' },
        ],
      },
    ],
    drills: [
      {
        id: 'shi-reorder-1',
        kind: 'reorder',
        rule: '是 sits between the two nouns.',
        target: {
          zh: '我是学生',
          en: 'I am a student.',
          chunks: [
            wo,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hoon', deva: 'हूँ' },
            { slot: 'object', zh: '学生', py: 'xuésheng', roman: 'student', deva: 'छात्र' },
          ],
        },
      },
      {
        id: 'shi-fill-1',
        kind: 'fill',
        blankSlot: 'verb',
        chips: ['是', '很', '在'],
        rule: 'Noun to noun takes 是; adjectives take 很.',
        target: {
          zh: '他是老师',
          en: 'He is a teacher.',
          chunks: [
            ta,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '老师', py: 'lǎoshī', roman: 'teacher', deva: 'शिक्षक' },
          ],
        },
      },
      {
        id: 'shi-transform-1',
        kind: 'transform',
        ask: 'Say it about him instead.',
        rule: 'Only the subject changes; 是 stays put.',
        from: {
          zh: '我是学生',
          en: 'I am a student.',
          chunks: [wo, { slot: 'verb', zh: '是', py: 'shì' }, { slot: 'object', zh: '学生', py: 'xuésheng' }],
        },
        target: {
          zh: '他是学生',
          en: 'He is a student.',
          chunks: [
            ta,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '学生', py: 'xuésheng', roman: 'student', deva: 'छात्र' },
          ],
        },
      },
      {
        id: 'shi-translate-1',
        kind: 'translate',
        rule: 'Two nouns need 是 between them.',
        target: {
          zh: '她是我的朋友',
          en: 'She is my friend.',
          chunks: [
            taF,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '我的朋友', py: 'wǒ de péngyou', roman: 'meri dost', deva: 'मेरी दोस्त' },
          ],
        },
      },
      {
        id: 'shi-build-1',
        kind: 'build',
        ask: 'Say who you are, or what your job is.',
        rule: 'Any noun works after 是.',
        target: {
          zh: '我是老师',
          en: 'I am a teacher.',
          alsoOk: ['我是学生'],
          chunks: [
            wo,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hoon', deva: 'हूँ' },
            { slot: 'object', zh: '老师', py: 'lǎoshī', roman: 'teacher', deva: 'शिक्षक' },
          ],
        },
      },
      {
        id: 'shi-sayit-1',
        kind: 'sayit',
        rule: 'Noun, 是, noun.',
        target: {
          zh: '我是学生',
          en: 'I am a student.',
          chunks: [
            wo,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hoon', deva: 'हूँ' },
            { slot: 'object', zh: '学生', py: 'xuésheng', roman: 'student', deva: 'छात्र' },
          ],
        },
      },
    ],
  },

  {
    id: 'ma-question',
    name: '吗 turns a statement into a question',
    hsk: 1,
    rule: 'Leave the word order alone and put 吗 at the end.',
    skeleton: ['subject', 'verb', 'object'],
    targets: ['PARTICLE.ma_missing'],
    transfer: {
      positive: true,
      text: 'Hindi does the same with kya — the sentence keeps its shape and a question word does the work.',
    },
    examples: [
      {
        zh: '你是老师吗',
        en: 'Are you a teacher?',
        chunks: [
          ni,
          { slot: 'verb', zh: '是', py: 'shì', roman: 'ho', deva: 'हो' },
          { slot: 'object', zh: '老师', py: 'lǎoshī', roman: 'teacher', deva: 'शिक्षक' },
          { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
        ],
      },
      {
        zh: '你明天去吗',
        en: 'Are you going tomorrow?',
        chunks: [
          ni,
          mingtian,
          { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaoge', deva: 'जाओगे' },
          { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
        ],
      },
    ],
    drills: [
      {
        id: 'ma-reorder-1',
        kind: 'reorder',
        rule: '吗 goes last, and nothing else moves.',
        target: {
          zh: '你是老师吗',
          en: 'Are you a teacher?',
          chunks: [
            ni,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'ho', deva: 'हो' },
            { slot: 'object', zh: '老师', py: 'lǎoshī', roman: 'teacher', deva: 'शिक्षक' },
            { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
          ],
        },
      },
      {
        id: 'ma-fill-1',
        kind: 'fill',
        blankSlot: 'complement',
        chips: ['吗', '了', '的'],
        rule: 'A yes-or-no question ends in 吗.',
        target: {
          zh: '你明天去吗',
          en: 'Are you going tomorrow?',
          chunks: [
            ni,
            mingtian,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaoge', deva: 'जाओगे' },
            { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
          ],
        },
      },
      {
        id: 'ma-transform-1',
        kind: 'transform',
        ask: 'Turn this into a question.',
        rule: 'Add 吗. Do not reorder anything, the way English would.',
        from: {
          zh: '你是学生',
          en: 'You are a student.',
          chunks: [ni, { slot: 'verb', zh: '是', py: 'shì' }, { slot: 'object', zh: '学生', py: 'xuésheng' }],
        },
        target: {
          zh: '你是学生吗',
          en: 'Are you a student?',
          chunks: [
            ni,
            { slot: 'verb', zh: '是', py: 'shì', roman: 'ho', deva: 'हो' },
            { slot: 'object', zh: '学生', py: 'xuésheng', roman: 'student', deva: 'छात्र' },
            { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
          ],
        },
      },
      {
        id: 'ma-translate-1',
        kind: 'translate',
        rule: 'Statement order, then 吗.',
        target: {
          zh: '你今天忙吗',
          en: 'Are you busy today?',
          chunks: [
            ni,
            jintian,
            { slot: 'verb', zh: '忙', py: 'máng', roman: 'vyast', deva: 'व्यस्त' },
            { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
          ],
        },
      },
      {
        id: 'ma-sayit-1',
        kind: 'sayit',
        rule: 'Nothing moves — 吗 just arrives at the end.',
        target: {
          zh: '你明天去吗',
          en: 'Are you going tomorrow?',
          chunks: [
            ni,
            mingtian,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaoge', deva: 'जाओगे' },
            { slot: 'complement', zh: '吗', py: 'ma', roman: 'kya', deva: 'क्या' },
          ],
        },
      },
    ],
  },
];
