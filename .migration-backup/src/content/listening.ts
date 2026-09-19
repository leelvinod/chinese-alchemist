/* Mandarin Mitra — listening content. Audio is cached, so both drills work offline. */

import type { MinimalPairItem, TonePairItem } from './types';

export const TONE_PAIRS: TonePairItem[] = [
  { zh: '朋友', py: 'péngyou', en: 'friend', tones: [2, 5] },
  { zh: '明天', py: 'míngtiān', en: 'tomorrow', tones: [2, 1] },
  { zh: '中文', py: 'Zhōngwén', en: 'Chinese', tones: [1, 2] },
  { zh: '老师', py: 'lǎoshī', en: 'teacher', tones: [3, 1] },
  { zh: '汉语', py: 'Hànyǔ', en: 'Chinese language', tones: [4, 3] },
  { zh: '工作', py: 'gōngzuò', en: 'work', tones: [1, 4] },
  { zh: '电影', py: 'diànyǐng', en: 'film', tones: [4, 3] },
  { zh: '哥哥', py: 'gēge', en: 'older brother', tones: [1, 5] },
  { zh: '时间', py: 'shíjiān', en: 'time', tones: [2, 1] },
  { zh: '可以', py: 'kěyǐ', en: 'may, can', tones: [3, 3] },
  { zh: '医院', py: 'yīyuàn', en: 'hospital', tones: [1, 4] },
  { zh: '面包', py: 'miànbāo', en: 'bread', tones: [4, 1] },
];

export const MINIMAL_PAIRS: MinimalPairItem[] = [
  { id: 'mp-n-ng-1', contrast: '-n / -ng', a: { zh: '人民', py: 'rénmín', en: 'the people' }, b: { zh: '人名', py: 'rénmíng', en: "a person's name" }, answer: 'a', hindiHint: 'The -ng ending hums on: न vs ङ.' },
  { id: 'mp-n-ng-2', contrast: '-n / -ng', a: { zh: '心', py: 'xīn', en: 'heart' }, b: { zh: '星', py: 'xīng', en: 'star' }, answer: 'b', hindiHint: 'Hold the back of the tongue up for -ng.' },
  { id: 'mp-asp-1', contrast: 'aspiration b/p', a: { zh: '白', py: 'bái', en: 'white' }, b: { zh: '拍', py: 'pāi', en: 'to clap' }, answer: 'b', hindiHint: 'ब vs फ — the breath is the difference.' },
  { id: 'mp-asp-2', contrast: 'aspiration d/t', a: { zh: '大', py: 'dà', en: 'big' }, b: { zh: '他', py: 'tā', en: 'he' }, answer: 'a', hindiHint: 'त vs थ.' },
  { id: 'mp-asp-3', contrast: 'aspiration g/k', a: { zh: '高', py: 'gāo', en: 'tall' }, b: { zh: '考', py: 'kǎo', en: 'to test' }, answer: 'a', hindiHint: 'क vs ख.' },
  { id: 'mp-z-zh-1', contrast: 'z / zh', a: { zh: '在', py: 'zài', en: 'at' }, b: { zh: '摘', py: 'zhāi', en: 'to pick' }, answer: 'a', hindiHint: 'zh curls the tongue back; z does not.' },
  { id: 'mp-c-ch-1', contrast: 'c / ch', a: { zh: '菜', py: 'cài', en: 'dish, vegetable' }, b: { zh: '差', py: 'chà', en: 'poor, lacking' }, answer: 'a' },
  { id: 'mp-s-sh-1', contrast: 's / sh', a: { zh: '四', py: 'sì', en: 'four' }, b: { zh: '是', py: 'shì', en: 'to be' }, answer: 'b', hindiHint: 'स vs श, but with the tongue further back for sh.' },
  { id: 'mp-u-yu-1', contrast: 'ü / u', a: { zh: '路', py: 'lù', en: 'road' }, b: { zh: '绿', py: 'lǜ', en: 'green' }, answer: 'b', hindiHint: 'Round the lips for u, then smile for ü.' },
  { id: 'mp-j-zh-1', contrast: 'j / zh', a: { zh: '鸡', py: 'jī', en: 'chicken' }, b: { zh: '知', py: 'zhī', en: 'to know' }, answer: 'a' },
];

export const CONTRAST_SETS = [...new Set(MINIMAL_PAIRS.map((m) => m.contrast))];

/** Four named voices, so the learner hears the item is changing on purpose. */
export const TTS_VOICES = ['Voice A', 'Voice B', 'Voice C', 'Voice D'] as const;
