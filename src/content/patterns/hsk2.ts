/* HSK 2 patterns.
   */

import type { Pattern } from '../types';
import { le, mingtian, ta, wo, zuotian } from './shared';

export const HSK2: Pattern[] = [
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
          le,
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
          le,
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
            le,
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
            le,
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
            le,
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
            le,
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
          le,
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
            le,
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
    id: 'bu-mei',
    name: '不 and 没',
    hsk: 2,
    rule: '不 denies what you do or will do; 没 denies that something happened.',
    skeleton: ['subject', 'manner', 'verb', 'object'],
    targets: ['NEGATION.wrong_negator'],
    transfer: {
      positive: false,
      text: 'Hindi uses nahin for both. Chinese splits them by time: 不去 for "will not go", 没去 for "did not go".',
    },
    examples: [
      {
        zh: '我不去',
        en: 'I am not going.',
        chunks: [
          wo,
          { slot: 'manner', zh: '不', py: 'bù', roman: 'nahin', deva: 'नहीं' },
          { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
        ],
      },
      {
        zh: '我昨天没去',
        en: 'I did not go yesterday.',
        chunks: [
          wo,
          zuotian,
          { slot: 'manner', zh: '没', py: 'méi', roman: 'nahin', deva: 'नहीं' },
          { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
        ],
      },
    ],
    drills: [
      {
        id: 'bumei-reorder-1',
        kind: 'reorder',
        rule: 'The negator sits right in front of the verb.',
        target: {
          zh: '我昨天没去',
          en: 'I did not go yesterday.',
          chunks: [
            wo,
            zuotian,
            { slot: 'manner', zh: '没', py: 'méi', roman: 'nahin', deva: 'नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
          ],
        },
      },
      {
        id: 'bumei-fill-1',
        kind: 'fill',
        blankSlot: 'manner',
        chips: ['没', '不', '很'],
        rule: 'Something that did not happen takes 没.',
        target: {
          zh: '我昨天没去',
          en: 'I did not go yesterday.',
          chunks: [
            wo,
            zuotian,
            { slot: 'manner', zh: '没', py: 'méi', roman: 'nahin', deva: 'नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
          ],
        },
      },
      {
        id: 'bumei-transform-1',
        kind: 'transform',
        ask: 'Say you are not going tomorrow.',
        rule: 'Future or habit takes 不, not 没.',
        from: {
          zh: '我明天去',
          en: 'I am going tomorrow.',
          chunks: [wo, mingtian, { slot: 'verb', zh: '去', py: 'qù' }],
        },
        target: {
          zh: '我明天不去',
          en: 'I am not going tomorrow.',
          chunks: [
            wo,
            mingtian,
            { slot: 'manner', zh: '不', py: 'bù', roman: 'nahin', deva: 'नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          ],
        },
      },
      {
        id: 'bumei-translate-1',
        kind: 'translate',
        rule: 'It already happened, so 没.',
        target: {
          zh: '我没看电影',
          en: 'I did not watch the film.',
          chunks: [
            wo,
            { slot: 'manner', zh: '没', py: 'méi', roman: 'nahin', deva: 'नहीं' },
            { slot: 'verb', zh: '看', py: 'kàn', roman: 'dekhi', deva: 'देखी' },
            { slot: 'object', zh: '电影', py: 'diànyǐng', roman: 'film', deva: 'फ़िल्म' },
          ],
        },
      },
      {
        id: 'bumei-sayit-1',
        kind: 'sayit',
        rule: 'Past takes 没, everything else takes 不.',
        target: {
          zh: '我昨天没去',
          en: 'I did not go yesterday.',
          chunks: [
            wo,
            zuotian,
            { slot: 'manner', zh: '没', py: 'méi', roman: 'nahin', deva: 'नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
          ],
        },
      },
    ],
  },

  {
    id: 'de-possessive',
    name: '的 for whose it is',
    hsk: 2,
    rule: '的 joins the owner to the thing, in that order.',
    skeleton: ['subject', 'verb', 'object'],
    targets: ['PARTICLE.de_missing'],
    transfer: {
      positive: true,
      text: 'The order matches Hindi: mera dost, 我的朋友 — owner first, then the thing.',
    },
    examples: [
      {
        zh: '这是我的书',
        en: 'This is my book.',
        chunks: [
          { slot: 'subject', zh: '这', py: 'zhè', roman: 'yah', deva: 'यह' },
          { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
          { slot: 'object', zh: '我的书', py: 'wǒ de shū', roman: 'meri kitaab', deva: 'मेरी किताब' },
        ],
      },
      {
        zh: '他的中文很好',
        en: 'His Chinese is very good.',
        chunks: [
          { slot: 'subject', zh: '他的中文', py: 'tā de Zhōngwén', roman: 'uski Chinese', deva: 'उसकी चीनी' },
          { slot: 'manner', zh: '很', py: 'hěn' },
          { slot: 'verb', zh: '好', py: 'hǎo', roman: 'acchi', deva: 'अच्छी' },
        ],
      },
    ],
    drills: [
      {
        id: 'depo-reorder-1',
        kind: 'reorder',
        rule: 'Owner, then 的, then the thing.',
        target: {
          zh: '这是我的书',
          en: 'This is my book.',
          chunks: [
            { slot: 'subject', zh: '这', py: 'zhè', roman: 'yah', deva: 'यह' },
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '我的书', py: 'wǒ de shū', roman: 'meri kitaab', deva: 'मेरी किताब' },
          ],
        },
      },
      {
        id: 'depo-fill-1',
        kind: 'fill',
        blankSlot: 'object',
        chips: ['我的书', '书我的', '我书'],
        rule: '的 sits between the owner and the thing.',
        target: {
          zh: '这是我的书',
          en: 'This is my book.',
          chunks: [
            { slot: 'subject', zh: '这', py: 'zhè', roman: 'yah', deva: 'यह' },
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '我的书', py: 'wǒ de shū', roman: 'meri kitaab', deva: 'मेरी किताब' },
          ],
        },
      },
      {
        id: 'depo-transform-1',
        kind: 'transform',
        ask: 'Make it his book instead.',
        rule: 'Only the owner changes.',
        from: {
          zh: '这是我的书',
          en: 'This is my book.',
          chunks: [
            { slot: 'subject', zh: '这', py: 'zhè' },
            { slot: 'verb', zh: '是', py: 'shì' },
            { slot: 'object', zh: '我的书', py: 'wǒ de shū' },
          ],
        },
        target: {
          zh: '这是他的书',
          en: 'This is his book.',
          chunks: [
            { slot: 'subject', zh: '这', py: 'zhè', roman: 'yah', deva: 'यह' },
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '他的书', py: 'tā de shū', roman: 'uski kitaab', deva: 'उसकी किताब' },
          ],
        },
      },
      {
        id: 'depo-translate-1',
        kind: 'translate',
        rule: 'Owner, 的, thing.',
        target: {
          zh: '这是我的家',
          en: 'This is my home.',
          chunks: [
            { slot: 'subject', zh: '这', py: 'zhè', roman: 'yah', deva: 'यह' },
            { slot: 'verb', zh: '是', py: 'shì', roman: 'hai', deva: 'है' },
            { slot: 'object', zh: '我的家', py: 'wǒ de jiā', roman: 'mera ghar', deva: 'मेरा घर' },
          ],
        },
      },
      {
        id: 'depo-sayit-1',
        kind: 'sayit',
        rule: 'Do not drop 的.',
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
    ],
  },
];
