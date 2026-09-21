/* HSK 3 patterns.
   */

import type { Pattern } from '../types';
import { ta, wo } from './shared';

export const HSK3: Pattern[] = [
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

  {
    id: 'bi-comparison',
    name: '比 for comparisons',
    hsk: 3,
    rule: 'A 比 B, then the adjective — and the adjective drops its 很.',
    skeleton: ['subject', 'manner', 'verb'],
    targets: ['WORD_ORDER.manner_misplaced'],
    transfer: {
      positive: false,
      text: 'Hindi builds it the other way: vah mujhse lamba hai puts the yardstick after. Chinese puts 比我 before the adjective.',
    },
    examples: [
      {
        zh: '他比我高',
        en: 'He is taller than me.',
        chunks: [
          ta,
          { slot: 'manner', zh: '比我', py: 'bǐ wǒ', roman: 'mujhse', deva: 'मुझसे' },
          { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
        ],
      },
      {
        zh: '今天比昨天热',
        en: 'Today is hotter than yesterday.',
        chunks: [
          { slot: 'subject', zh: '今天', py: 'jīntiān', roman: 'aaj', deva: 'आज' },
          { slot: 'manner', zh: '比昨天', py: 'bǐ zuótiān', roman: 'kal se', deva: 'कल से' },
          { slot: 'verb', zh: '热', py: 'rè', roman: 'garam', deva: 'गरम' },
        ],
      },
    ],
    drills: [
      {
        id: 'bi-reorder-1',
        kind: 'reorder',
        rule: '比 and its yardstick come before the adjective.',
        target: {
          zh: '他比我高',
          en: 'He is taller than me.',
          chunks: [
            ta,
            { slot: 'manner', zh: '比我', py: 'bǐ wǒ', roman: 'mujhse', deva: 'मुझसे' },
            { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
          ],
        },
      },
      {
        id: 'bi-fill-1',
        kind: 'fill',
        blankSlot: 'manner',
        chips: ['比我', '我比', '比'],
        rule: '比 takes the thing compared against right after it.',
        target: {
          zh: '他比我高',
          en: 'He is taller than me.',
          chunks: [
            ta,
            { slot: 'manner', zh: '比我', py: 'bǐ wǒ', roman: 'mujhse', deva: 'मुझसे' },
            { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
          ],
        },
      },
      {
        id: 'bi-transform-1',
        kind: 'transform',
        ask: 'Turn this into a comparison with yesterday.',
        rule: 'A comparison drops 很 — 比 is doing that work now.',
        from: {
          zh: '今天很热',
          en: 'It is hot today.',
          chunks: [
            { slot: 'subject', zh: '今天', py: 'jīntiān' },
            { slot: 'manner', zh: '很', py: 'hěn' },
            { slot: 'verb', zh: '热', py: 'rè' },
          ],
        },
        target: {
          zh: '今天比昨天热',
          en: 'Today is hotter than yesterday.',
          chunks: [
            { slot: 'subject', zh: '今天', py: 'jīntiān', roman: 'aaj', deva: 'आज' },
            { slot: 'manner', zh: '比昨天', py: 'bǐ zuótiān', roman: 'kal se', deva: 'कल से' },
            { slot: 'verb', zh: '热', py: 'rè', roman: 'garam', deva: 'गरम' },
          ],
        },
      },
      {
        id: 'bi-translate-1',
        kind: 'translate',
        rule: 'No 很 in a 比 sentence.',
        target: {
          zh: '我比他忙',
          en: 'I am busier than him.',
          chunks: [
            wo,
            { slot: 'manner', zh: '比他', py: 'bǐ tā', roman: 'usse', deva: 'उससे' },
            { slot: 'verb', zh: '忙', py: 'máng', roman: 'vyast', deva: 'व्यस्त' },
          ],
        },
      },
      {
        id: 'bi-sayit-1',
        kind: 'sayit',
        rule: 'Subject, 比 plus yardstick, then the adjective.',
        target: {
          zh: '他比我高',
          en: 'He is taller than me.',
          chunks: [
            ta,
            { slot: 'manner', zh: '比我', py: 'bǐ wǒ', roman: 'mujhse', deva: 'मुझसे' },
            { slot: 'verb', zh: '高', py: 'gāo', roman: 'lamba', deva: 'लंबा' },
          ],
        },
      },
    ],
  },

  {
    id: 'guo-experience',
    name: '过 for things you have done',
    hsk: 3,
    rule: '过 after the verb says you have done it at some point, not that you did it just now.',
    skeleton: ['subject', 'verb', 'complement', 'object'],
    targets: ['PARTICLE.le_missing'],
    transfer: {
      positive: false,
      text: 'Hindi leans on kabhi gaya hoon for this. Chinese marks it on the verb instead: 去过.',
    },
    examples: [
      {
        zh: '我去过中国',
        en: 'I have been to China.',
        chunks: [
          wo,
          { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
          { slot: 'complement', zh: '过', py: 'guo' },
          { slot: 'object', zh: '中国', py: 'Zhōngguó', roman: 'China', deva: 'चीन' },
        ],
      },
      {
        zh: '他吃过中国菜',
        en: 'He has eaten Chinese food.',
        chunks: [
          ta,
          { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaaya', deva: 'खाया' },
          { slot: 'complement', zh: '过', py: 'guo' },
          { slot: 'object', zh: '中国菜', py: 'Zhōngguó cài', roman: 'Chinese khaana', deva: 'चीनी खाना' },
        ],
      },
    ],
    drills: [
      {
        id: 'guo-reorder-1',
        kind: 'reorder',
        rule: '过 clings to the verb, before the object.',
        target: {
          zh: '我去过中国',
          en: 'I have been to China.',
          chunks: [
            wo,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
            { slot: 'complement', zh: '过', py: 'guo' },
            { slot: 'object', zh: '中国', py: 'Zhōngguó', roman: 'China', deva: 'चीन' },
          ],
        },
      },
      {
        id: 'guo-transform-1',
        kind: 'transform',
        ask: 'Say you have done it before, not that you did it.',
        rule: 'Swap 了 for 过 when you mean the experience rather than the event.',
        from: {
          zh: '我吃了中国菜',
          en: 'I ate Chinese food.',
          chunks: [
            wo,
            { slot: 'verb', zh: '吃', py: 'chī' },
            { slot: 'complement', zh: '了', py: 'le' },
            { slot: 'object', zh: '中国菜', py: 'Zhōngguó cài' },
          ],
        },
        target: {
          zh: '我吃过中国菜',
          en: 'I have eaten Chinese food.',
          chunks: [
            wo,
            { slot: 'verb', zh: '吃', py: 'chī', roman: 'khaaya', deva: 'खाया' },
            { slot: 'complement', zh: '过', py: 'guo' },
            { slot: 'object', zh: '中国菜', py: 'Zhōngguó cài', roman: 'Chinese khaana', deva: 'चीनी खाना' },
          ],
        },
      },
      {
        id: 'guo-translate-1',
        kind: 'translate',
        rule: 'Verb, then 过, then the object.',
        target: {
          zh: '我去过台北',
          en: 'I have been to Taipei.',
          chunks: [
            wo,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
            { slot: 'complement', zh: '过', py: 'guo' },
            { slot: 'object', zh: '台北', py: 'Táiběi', roman: 'Taipei', deva: 'ताइपे' },
          ],
        },
      },
      {
        id: 'guo-sayit-1',
        kind: 'sayit',
        rule: '过 marks the experience, on the verb.',
        target: {
          zh: '我去过中国',
          en: 'I have been to China.',
          chunks: [
            wo,
            { slot: 'verb', zh: '去', py: 'qù', roman: 'gaya', deva: 'गया' },
            { slot: 'complement', zh: '过', py: 'guo' },
            { slot: 'object', zh: '中国', py: 'Zhōngguó', roman: 'China', deva: 'चीन' },
          ],
        },
      },
    ],
  },
];
