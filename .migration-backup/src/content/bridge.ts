/* Mandarin Mitra — the Hindi bridge content: the Indic pinyin primer (BR-02)
   and the three mini-modules (BR-03). Hindi is a helper, never a wall. */

import type { PinyinCell } from './types';

export const PRIMER_BANNER =
  'Hindi has the aspiration contrast English lacks: b/p = प/फ, d/t = त/थ, g/k = क/ख.';

export const PINYIN_INITIALS: PinyinCell[] = [
  { py: 'b', deva: 'प', accuracy: '' },
  { py: 'p', deva: 'फ', accuracy: '' },
  { py: 'm', deva: 'म', accuracy: '' },
  { py: 'f', deva: 'फ़', accuracy: '' },
  { py: 'd', deva: 'त', accuracy: '' },
  { py: 't', deva: 'थ', accuracy: '' },
  { py: 'n', deva: 'न', accuracy: '' },
  { py: 'l', deva: 'ल', accuracy: '' },
  { py: 'g', deva: 'क', accuracy: '' },
  { py: 'k', deva: 'ख', accuracy: '' },
  { py: 'h', deva: 'ह', accuracy: '≈', note: 'Further back in the throat than Hindi ह.' },
  { py: 'j', deva: null, accuracy: 'x', note: 'No Hindi equivalent. Tongue flat, tip behind the lower teeth.' },
  { py: 'q', deva: null, accuracy: 'x', note: 'No Hindi equivalent. Like j, but with a strong puff of breath.' },
  { py: 'x', deva: null, accuracy: 'x', note: 'No Hindi equivalent. Between श and स, tongue flat and forward.' },
  { py: 'zh', deva: null, accuracy: 'x', note: 'Tongue curled back — not Hindi ज. Closer to English "j" in "jar".' },
  { py: 'ch', deva: null, accuracy: 'x', note: 'zh with breath. Not Hindi छ.' },
  { py: 'sh', deva: null, accuracy: 'x', note: 'Tongue curled back, not Hindi श.' },
  { py: 'r', deva: null, accuracy: 'x', note: 'Not a Hindi र at all — closer to English "r" in "run", tongue curled.' },
  { py: 'z', deva: 'ज़', accuracy: '≈', note: 'A "dz" cluster: द + ज़ run together.' },
  { py: 'c', deva: null, accuracy: 'x', note: 'A "ts" cluster with breath.' },
  { py: 's', deva: 'स', accuracy: '' },
  { py: 'y', deva: 'य', accuracy: '' },
  { py: 'w', deva: 'व', accuracy: '≈', note: 'Rounder than Hindi व — the lips do the work.' },
];

export const PINYIN_FINALS: PinyinCell[] = [
  { py: 'a', deva: 'आ', accuracy: '' },
  { py: 'o', deva: 'ओ', accuracy: '' },
  { py: 'e', deva: null, accuracy: 'x', note: 'No Hindi equivalent. A flat, mid-back vowel — not ए.' },
  { py: 'i', deva: 'ई', accuracy: '' },
  { py: 'u', deva: 'ऊ', accuracy: '' },
  { py: 'ü', deva: null, accuracy: 'x', note: 'No Hindi equivalent. Say ई and round your lips.' },
  { py: 'ai', deva: 'ऐ', accuracy: '≈' },
  { py: 'ei', deva: 'ए', accuracy: '≈' },
  { py: 'ao', deva: 'औ', accuracy: '≈' },
  { py: 'ou', deva: 'ओ', accuracy: '≈' },
  { py: 'an', deva: 'आन', accuracy: '' },
  { py: 'ang', deva: 'आङ', accuracy: '≈', note: 'Hindi marks this with a bindu; Chinese wants a full -ng.' },
  { py: 'en', deva: 'अन', accuracy: '≈' },
  { py: 'eng', deva: 'अङ', accuracy: '≈', note: 'Hold the back of the tongue up.' },
  { py: 'in', deva: 'इन', accuracy: '' },
  { py: 'ing', deva: 'इङ', accuracy: '≈' },
  { py: 'ong', deva: 'ओङ', accuracy: '≈' },
  { py: 'er', deva: null, accuracy: 'x', note: 'Curl the tongue at the end. No Hindi equivalent.' },
];

export interface MiniModuleItem {
  zh: string;
  py: string;
  hindi: string;
  hindiDeva: string;
  en: string;
  note?: string;
}

export interface MiniModule {
  id: string;
  name: string;
  kind: 'tree' | 'cards';
  blurb: string;
  items: MiniModuleItem[];
}

export const MINI_MODULES: MiniModule[] = [
  {
    id: 'kinship',
    name: 'Kinship',
    kind: 'tree',
    blurb:
      'Chinese splits the family tree the way Hindi does — by side and by age. Where English has one word, both languages have four.',
    items: [
      { zh: '舅舅', py: 'jiùjiu', hindi: 'maama', hindiDeva: 'मामा', en: "mother's brother" },
      { zh: '叔叔', py: 'shūshu', hindi: 'chacha', hindiDeva: 'चाचा', en: "father's younger brother" },
      { zh: '伯伯', py: 'bóbo', hindi: 'taaya', hindiDeva: 'ताया', en: "father's older brother" },
      { zh: '姑姑', py: 'gūgu', hindi: 'bua', hindiDeva: 'बुआ', en: "father's sister" },
      { zh: '姨', py: 'yí', hindi: 'mausi', hindiDeva: 'मौसी', en: "mother's sister" },
      { zh: '哥哥', py: 'gēge', hindi: 'bade bhai', hindiDeva: 'बड़े भाई', en: 'older brother' },
      { zh: '弟弟', py: 'dìdi', hindi: 'chhote bhai', hindiDeva: 'छोटे भाई', en: 'younger brother' },
      { zh: '姐姐', py: 'jiějie', hindi: 'badi behen', hindiDeva: 'बड़ी बहन', en: 'older sister' },
      { zh: '妹妹', py: 'mèimei', hindi: 'chhoti behen', hindiDeva: 'छोटी बहन', en: 'younger sister' },
      { zh: '爷爷', py: 'yéye', hindi: 'dada', hindiDeva: 'दादा', en: "father's father" },
      { zh: '外公', py: 'wàigōng', hindi: 'nana', hindiDeva: 'नाना', en: "mother's father" },
      { zh: '奶奶', py: 'nǎinai', hindi: 'dadi', hindiDeva: 'दादी', en: "father's mother" },
      { zh: '外婆', py: 'wàipó', hindi: 'nani', hindiDeva: 'नानी', en: "mother's mother" },
    ],
  },
  {
    id: 'politeness',
    name: 'Politeness',
    kind: 'cards',
    blurb: '您 is to 你 what aap is to tum. The situations line up almost exactly.',
    items: [
      { zh: '您好', py: 'nín hǎo', hindi: 'aap kaise hain', hindiDeva: 'आप कैसे हैं', en: 'hello (polite)', note: 'A stranger, a customer, someone older.' },
      { zh: '你好', py: 'nǐ hǎo', hindi: 'tum kaise ho', hindiDeva: 'तुम कैसे हो', en: 'hello (neutral)', note: 'A classmate, a colleague your age.' },
      { zh: '请', py: 'qǐng', hindi: 'kripya', hindiDeva: 'कृपया', en: 'please', note: 'Goes in front of the verb: 请坐.' },
      { zh: '谢谢', py: 'xièxie', hindi: 'dhanyavaad', hindiDeva: 'धन्यवाद', en: 'thank you' },
      { zh: '不客气', py: 'bú kèqi', hindi: 'koi baat nahin', hindiDeva: 'कोई बात नहीं', en: "you're welcome" },
      { zh: '对不起', py: 'duìbuqǐ', hindi: 'maaf kijiye', hindiDeva: 'माफ़ कीजिए', en: 'sorry' },
      { zh: '麻烦您', py: 'máfan nín', hindi: 'aapko takleef', hindiDeva: 'आपको तकलीफ़', en: 'sorry to trouble you', note: 'Softens a request, exactly like the Hindi.' },
      { zh: '请问', py: 'qǐngwèn', hindi: 'ek baat puchhni thi', hindiDeva: 'एक बात पूछनी थी', en: 'may I ask' },
    ],
  },
  {
    id: 'greetings',
    name: 'Greetings',
    kind: 'cards',
    blurb: 'Both languages greet through food and through where you are going. Translate the move, not the words.',
    items: [
      { zh: '吃饭了吗', py: 'chī fàn le ma', hindi: 'khaana khaaya?', hindiDeva: 'खाना खाया?', en: 'have you eaten?', note: 'A greeting, not a real question. Same as the Hindi.' },
      { zh: '你去哪儿', py: 'nǐ qù nǎr', hindi: 'kahaan ja rahe ho?', hindiDeva: 'कहाँ जा रहे हो?', en: 'where are you off to?', note: 'Small talk. "出去一下" is a fine answer.' },
      { zh: '好久不见', py: 'hǎojiǔ bú jiàn', hindi: 'bahut din baad', hindiDeva: 'बहुत दिन बाद', en: 'long time no see' },
      { zh: '最近怎么样', py: 'zuìjìn zěnmeyàng', hindi: 'aajkal kaisa chal raha hai', hindiDeva: 'आजकल कैसा चल रहा है', en: 'how have you been?' },
      { zh: '慢走', py: 'màn zǒu', hindi: 'sambhal ke jaana', hindiDeva: 'सँभल के जाना', en: 'take care on your way', note: 'Said to the person leaving.' },
      { zh: '再见', py: 'zàijiàn', hindi: 'phir milenge', hindiDeva: 'फिर मिलेंगे', en: 'goodbye' },
    ],
  },
];
