/* HSK 4 patterns. The paired connectors and the 把 sentence — the two places
   where a learner who is otherwise fluent still sounds translated. */

import type { Pattern } from '../types';
import { wo } from './shared';

export const HSK4: Pattern[] = [
  {
    id: 'ruguo-jiu',
    name: 'Paired connectors (如果…就)',
    hsk: 4,
    rule: '如果 opens the condition and 就 opens the result — both halves, every time.',
    skeleton: ['manner', 'verb', 'subject', 'manner', 'verb'],
    targets: ['CONNECTOR.missing_second'],
    transfer: {
      positive: true,
      text: 'Hindi pairs them the same way: agar … to. Keep the habit and the Chinese falls out.',
    },
    examples: [
      {
        zh: '如果下雨，我就不去',
        en: 'If it rains, I will not go.',
        chunks: [
          { slot: 'manner', zh: '如果', py: 'rúguǒ', roman: 'agar', deva: 'अगर' },
          { slot: 'verb', zh: '下雨', py: 'xià yǔ', roman: 'baarish hui', deva: 'बारिश हुई' },
          wo,
          { slot: 'manner', zh: '就不', py: 'jiù bù', roman: 'to nahin', deva: 'तो नहीं' },
          { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
        ],
      },
      {
        zh: '如果你来，我就做饭',
        en: 'If you come, I will cook.',
        chunks: [
          { slot: 'manner', zh: '如果', py: 'rúguǒ', roman: 'agar', deva: 'अगर' },
          { slot: 'subject', zh: '你', py: 'nǐ', roman: 'tum', deva: 'तुम' },
          { slot: 'verb', zh: '来', py: 'lái', roman: 'aaye', deva: 'आये' },
          wo,
          { slot: 'manner', zh: '就', py: 'jiù', roman: 'to', deva: 'तो' },
          { slot: 'verb', zh: '做饭', py: 'zuò fàn', roman: 'khaana banaunga', deva: 'खाना बनाऊँगा' },
        ],
      },
    ],
    drills: [
      {
        id: 'rg-join-1',
        kind: 'join',
        clauses: ['下雨。', '我不去。'],
        ask: 'Join these with 如果 … 就.',
        rule: '就 goes after the subject of the second clause, not at its head.',
        target: {
          zh: '如果下雨，我就不去',
          en: 'If it rains, I will not go.',
          alsoOk: ['如果下雨我就不去'],
          chunks: [
            { slot: 'manner', zh: '如果', py: 'rúguǒ', roman: 'agar', deva: 'अगर' },
            { slot: 'verb', zh: '下雨', py: 'xià yǔ', roman: 'baarish hui', deva: 'बारिश हुई' },
            wo,
            { slot: 'manner', zh: '就不', py: 'jiù bù', roman: 'to nahin', deva: 'तो नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          ],
        },
      },
      {
        id: 'rg-fill-1',
        kind: 'fill',
        blankSlot: 'manner',
        blankAt: 0,
        chips: ['如果', '虽然', '因为'],
        rule: 'A condition opens with 如果.',
        target: {
          zh: '如果下雨，我就不去',
          en: 'If it rains, I will not go.',
          chunks: [
            { slot: 'manner', zh: '如果', py: 'rúguǒ', roman: 'agar', deva: 'अगर' },
            { slot: 'verb', zh: '下雨', py: 'xià yǔ', roman: 'baarish hui', deva: 'बारिश हुई' },
            wo,
            { slot: 'manner', zh: '就不', py: 'jiù bù', roman: 'to nahin', deva: 'तो नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          ],
        },
      },
      {
        id: 'rg-translate-1',
        kind: 'translate',
        rule: 'Both halves: 如果 opens, 就 answers.',
        target: {
          zh: '如果你来，我就做饭',
          en: 'If you come, I will cook.',
          alsoOk: ['如果你来我就做饭'],
          chunks: [
            { slot: 'manner', zh: '如果', py: 'rúguǒ', roman: 'agar', deva: 'अगर' },
            { slot: 'subject', zh: '你', py: 'nǐ', roman: 'tum', deva: 'तुम' },
            { slot: 'verb', zh: '来', py: 'lái', roman: 'aaye', deva: 'आये' },
            wo,
            { slot: 'manner', zh: '就', py: 'jiù', roman: 'to', deva: 'तो' },
            { slot: 'verb', zh: '做饭', py: 'zuò fàn', roman: 'khaana banaunga', deva: 'खाना बनाऊँगा' },
          ],
        },
      },
      {
        id: 'rg-sayit-1',
        kind: 'sayit',
        rule: 'Do not drop 就.',
        target: {
          zh: '如果下雨，我就不去',
          en: 'If it rains, I will not go.',
          alsoOk: ['如果下雨我就不去'],
          chunks: [
            { slot: 'manner', zh: '如果', py: 'rúguǒ', roman: 'agar', deva: 'अगर' },
            { slot: 'verb', zh: '下雨', py: 'xià yǔ', roman: 'baarish hui', deva: 'बारिश हुई' },
            wo,
            { slot: 'manner', zh: '就不', py: 'jiù bù', roman: 'to nahin', deva: 'तो नहीं' },
            { slot: 'verb', zh: '去', py: 'qù', roman: 'jaaunga', deva: 'जाऊँगा' },
          ],
        },
      },
    ],
  },

  {
    id: 'ba-construction',
    name: '把 for what you did to a thing',
    hsk: 4,
    rule: '把 pulls the object in front of the verb, and the verb must say what became of it.',
    skeleton: ['subject', 'manner', 'verb', 'complement'],
    targets: ['WORD_ORDER.object_before_verb'],
    transfer: {
      positive: true,
      text: 'Hindi already puts the object first — kitaab mez par rakhi. 把书放在桌子上 does the same, and 把 is the marker that allows it.',
    },
    examples: [
      {
        zh: '我把书放在桌子上',
        en: 'I put the book on the table.',
        chunks: [
          wo,
          { slot: 'manner', zh: '把书', py: 'bǎ shū', roman: 'kitaab ko', deva: 'किताब को' },
          { slot: 'verb', zh: '放', py: 'fàng', roman: 'rakha', deva: 'रखा' },
          { slot: 'complement', zh: '在桌子上', py: 'zài zhuōzi shàng', roman: 'mez par', deva: 'मेज़ पर' },
        ],
      },
      {
        zh: '他把饭吃完了',
        en: 'He finished the food.',
        chunks: [
          { slot: 'subject', zh: '他', py: 'tā', roman: 'usne', deva: 'उसने' },
          { slot: 'manner', zh: '把饭', py: 'bǎ fàn', roman: 'khaana', deva: 'खाना' },
          { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaa', deva: 'खा' },
          { slot: 'complement', zh: '完了', py: 'wán le', roman: 'liya', deva: 'लिया' },
        ],
      },
    ],
    drills: [
      {
        id: 'ba-reorder-1',
        kind: 'reorder',
        rule: '把 plus the object come before the verb.',
        target: {
          zh: '我把书放在桌子上',
          en: 'I put the book on the table.',
          chunks: [
            wo,
            { slot: 'manner', zh: '把书', py: 'bǎ shū', roman: 'kitaab ko', deva: 'किताब को' },
            { slot: 'verb', zh: '放', py: 'fàng', roman: 'rakha', deva: 'रखा' },
            { slot: 'complement', zh: '在桌子上', py: 'zài zhuōzi shàng', roman: 'mez par', deva: 'मेज़ पर' },
          ],
        },
      },
      {
        id: 'ba-fill-1',
        kind: 'fill',
        blankSlot: 'manner',
        chips: ['把书', '书把', '把'],
        rule: '把 takes the object right after it.',
        target: {
          zh: '我把书放在桌子上',
          en: 'I put the book on the table.',
          chunks: [
            wo,
            { slot: 'manner', zh: '把书', py: 'bǎ shū', roman: 'kitaab ko', deva: 'किताब को' },
            { slot: 'verb', zh: '放', py: 'fàng', roman: 'rakha', deva: 'रखा' },
            { slot: 'complement', zh: '在桌子上', py: 'zài zhuōzi shàng', roman: 'mez par', deva: 'मेज़ पर' },
          ],
        },
      },
      {
        id: 'ba-transform-1',
        kind: 'transform',
        ask: 'Say what happened to the food, using 把.',
        rule: 'The verb needs a result after it — 完了, not 吃 on its own.',
        from: {
          zh: '他吃饭了',
          en: 'He ate.',
          chunks: [
            { slot: 'subject', zh: '他', py: 'tā' },
            { slot: 'verb', zh: '吃', py: 'chī' },
            { slot: 'object', zh: '饭', py: 'fàn' },
            { slot: 'complement', zh: '了', py: 'le' },
          ],
        },
        target: {
          zh: '他把饭吃完了',
          en: 'He finished the food.',
          chunks: [
            { slot: 'subject', zh: '他', py: 'tā', roman: 'usne', deva: 'उसने' },
            { slot: 'manner', zh: '把饭', py: 'bǎ fàn', roman: 'khaana', deva: 'खाना' },
            { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaa', deva: 'खा' },
            { slot: 'complement', zh: '完了', py: 'wán le', roman: 'liya', deva: 'लिया' },
          ],
        },
      },
      {
        id: 'ba-translate-1',
        kind: 'translate',
        rule: 'Object in front with 把, result after the verb.',
        target: {
          zh: '我把书看完了',
          en: 'I finished reading the book.',
          chunks: [
            wo,
            { slot: 'manner', zh: '把书', py: 'bǎ shū', roman: 'kitaab', deva: 'किताब' },
            { slot: 'verb', zh: '看', py: 'kàn', roman: 'padh', deva: 'पढ़' },
            { slot: 'complement', zh: '完了', py: 'wán le', roman: 'li', deva: 'ली' },
          ],
        },
      },
      {
        id: 'ba-sayit-1',
        kind: 'sayit',
        rule: 'Subject, 把 plus object, verb, result.',
        target: {
          zh: '我把书放在桌子上',
          en: 'I put the book on the table.',
          chunks: [
            wo,
            { slot: 'manner', zh: '把书', py: 'bǎ shū', roman: 'kitaab ko', deva: 'किताब को' },
            { slot: 'verb', zh: '放', py: 'fàng', roman: 'rakha', deva: 'रखा' },
            { slot: 'complement', zh: '在桌子上', py: 'zài zhuōzi shàng', roman: 'mez par', deva: 'मेज़ पर' },
          ],
        },
      },
    ],
  },
];
