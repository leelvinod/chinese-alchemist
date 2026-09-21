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

  // Deeper bank, so a long adaptive run never repeats an item.
  { id: 'p1-m4', kind: 'meaning', hsk: 1, prompt: '学生', options: ['student', 'teacher', 'doctor', 'shopkeeper'], answer: 'student' },
  { id: 'p1-m5', kind: 'meaning', hsk: 1, prompt: '书', options: ['book', 'paper', 'pen', 'bag'], answer: 'book' },
  { id: 'p1-r2', kind: 'reorder', hsk: 1, prompt: 'I am a student.', tiles: ['我', '是', '学生'], answer: '我是学生' },
  { id: 'p1-l2', kind: 'listen', hsk: 1, prompt: '书', options: ['书', '树', '数', '输'], answer: '书' },
  { id: 'p1-s2', kind: 'spoken', hsk: 1, prompt: 'I eat at home.', answer: '我在家吃饭' },

  { id: 'p2-m3', kind: 'meaning', hsk: 2, prompt: '没', options: ['did not', 'will not', 'cannot', 'must not'], answer: 'did not' },
  { id: 'p2-m4', kind: 'meaning', hsk: 2, prompt: '还', options: ['still', 'already', 'never', 'soon'], answer: 'still' },
  { id: 'p2-r2', kind: 'reorder', hsk: 2, prompt: 'This is my book.', tiles: ['这', '是', '我的书'], answer: '这是我的书' },
  { id: 'p2-l2', kind: 'listen', hsk: 2, prompt: '忙', options: ['忙', '茫', '芒', '盲'], answer: '忙' },
  { id: 'p2-s2', kind: 'spoken', hsk: 2, prompt: 'I did not go yesterday.', answer: '我昨天没去' },

  { id: 'p3-m3', kind: 'meaning', hsk: 3, prompt: '过', options: ['have done it before', 'doing it now', 'about to do it', 'never done it'], answer: 'have done it before' },
  { id: 'p3-m4', kind: 'meaning', hsk: 3, prompt: '比', options: ['than', 'with', 'for', 'about'], answer: 'than' },
  { id: 'p3-r2', kind: 'reorder', hsk: 3, prompt: 'He is taller than me.', tiles: ['他', '比我', '高'], answer: '他比我高' },
  { id: 'p3-s2', kind: 'spoken', hsk: 3, prompt: 'I have been to China.', answer: '我去过中国' },

  { id: 'p4-m3', kind: 'meaning', hsk: 4, prompt: '把', options: ['moves the object in front of the verb', 'marks a question', 'marks the past', 'marks politeness'], answer: 'moves the object in front of the verb' },
  { id: 'p4-r2', kind: 'reorder', hsk: 4, prompt: 'I put the book on the table.', tiles: ['我', '把书', '放', '在桌子上'], answer: '我把书放在桌子上' },
  { id: 'p4-l1', kind: 'listen', hsk: 4, prompt: '值得', options: ['值得', '知道', '直到', '至多'], answer: '值得' },
  { id: 'p4-s2', kind: 'spoken', hsk: 4, prompt: 'If it rains, I will not go.', answer: '如果下雨我就不去' },
];
