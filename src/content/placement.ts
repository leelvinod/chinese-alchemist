/* Mandarin Mitra — placement bank (ON-08).
   Adaptive: the planner picks the next item's level from how the last few went,
   so the learner never sees a count and never sees a "wrong" state. */

import type { PlacementItem } from './types';

export const PLACEMENT_ITEMS: PlacementItem[] = [
  // HSK 1
  { id: 'p1-m1', kind: 'meaning', hsk: 1, prompt: '明天', options: ['tomorrow', 'yesterday', 'today', 'tonight'], answer: 'tomorrow' },
  { id: 'p1-m2', kind: 'meaning', hsk: 1, prompt: '朋友', options: ['friend', 'family', 'teacher', 'neighbour'], answer: 'friend' },
  { id: 'p1-l1', kind: 'listen', hsk: 1, prompt: '家', options: ['家', '加', '街', '假'], answer: '家' },
  { id: 'p1-r1', kind: 'reorder', hsk: 1, prompt: 'I eat at home.', tiles: ['我', '在家', '吃', '饭'], answer: '我在家吃饭' },
  { id: 'p1-m3', kind: 'meaning', hsk: 1, prompt: '很', options: ['very', 'not', 'and', 'also'], answer: 'very' },
  { id: 'p1-s1', kind: 'spoken', hsk: 1, prompt: 'I am tired.', answer: '我很累' },

  // HSK 2
  { id: 'p2-m1', kind: 'meaning', hsk: 2, prompt: '工作', options: ['work', 'rest', 'study', 'travel'], answer: 'work' },
  { id: 'p2-r1', kind: 'reorder', hsk: 2, prompt: 'I bought three books.', tiles: ['我', '买', '了', '三本书'], answer: '我买了三本书' },
  { id: 'p2-l1', kind: 'listen', hsk: 2, prompt: '慢', options: ['慢', '忙', '满', '瞒'], answer: '慢' },
  { id: 'p2-m2', kind: 'meaning', hsk: 2, prompt: '一起', options: ['together', 'alone', 'early', 'again'], answer: 'together' },
  { id: 'p2-s1', kind: 'spoken', hsk: 2, prompt: "Tomorrow I'm going to Taipei.", answer: '我明天去台北' },

  // HSK 3
  { id: 'p3-m1', kind: 'meaning', hsk: 3, prompt: '虽然', options: ['although', 'because', 'therefore', 'unless'], answer: 'although' },
  { id: 'p3-r1', kind: 'reorder', hsk: 3, prompt: 'He speaks very fast.', tiles: ['他', '说', '得', '很快'], answer: '他说得很快' },
  { id: 'p3-m2', kind: 'meaning', hsk: 3, prompt: '同事', options: ['colleague', 'classmate', 'cousin', 'customer'], answer: 'colleague' },
  { id: 'p3-l1', kind: 'listen', hsk: 3, prompt: '记得', options: ['记得', '觉得', '值得', '找到'], answer: '记得' },
  { id: 'p3-s1', kind: 'spoken', hsk: 3, prompt: 'Although I am tired, I still have to work.', answer: '虽然我很累但是我还要工作' },

  // HSK 4
  { id: 'p4-m1', kind: 'meaning', hsk: 4, prompt: '值得', options: ['to be worth it', 'to remember', 'to decide', 'to expect'], answer: 'to be worth it' },
  { id: 'p4-m2', kind: 'meaning', hsk: 4, prompt: '既然', options: ['since (given that)', 'as soon as', 'in case', 'even though'], answer: 'since (given that)' },
  { id: 'p4-r1', kind: 'reorder', hsk: 4, prompt: 'This book is well worth reading.', tiles: ['这本书', '很', '值得', '看'], answer: '这本书很值得看' },
  { id: 'p4-s1', kind: 'spoken', hsk: 4, prompt: 'Because it rained, I stayed at home all day.', answer: '因为下雨所以我一天都在家' },
];
