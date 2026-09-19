/* Mandarin Mitra — vocabulary. Three facets per word (meaning, production,
   listening); the scheduler decides which facet comes up. */

import type { VocabWord } from './types';

export const VOCAB: VocabWord[] = [
  { id: 'v-mingtian', zh: '明天', py: 'míngtiān', en: 'tomorrow', hsk: 1, example: '我{明天}去台北。', examplePy: 'Wǒ míngtiān qù Táiběi.', exampleEn: "Tomorrow I'm going to Taipei." },
  { id: 'v-jia', zh: '家', py: 'jiā', en: 'home, family', hsk: 1, example: '我在{家}吃饭。', examplePy: 'Wǒ zài jiā chī fàn.', exampleEn: 'I eat at home.', measure: '个' },
  { id: 'v-chifan', zh: '吃饭', py: 'chī fàn', en: 'to eat a meal', hsk: 1, example: '我们一起{吃饭}吧。', examplePy: 'Wǒmen yìqǐ chī fàn ba.', exampleEn: "Let's eat together.", split: '吃过一次饭' },
  { id: 'v-pengyou', zh: '朋友', py: 'péngyou', en: 'friend', hsk: 1, example: '我跟{朋友}一起去。', examplePy: 'Wǒ gēn péngyou yìqǐ qù.', exampleEn: 'I am going with a friend.', measure: '个' },
  { id: 'v-lei', zh: '累', py: 'lèi', en: 'tired', hsk: 2, example: '我很{累}。', examplePy: 'Wǒ hěn lèi.', exampleEn: 'I am tired.', collocation: '很累 / 太累了' },
  { id: 'v-gongzuo', zh: '工作', py: 'gōngzuò', en: 'work, to work', hsk: 2, example: '他在公司{工作}。', examplePy: 'Tā zài gōngsī gōngzuò.', exampleEn: 'He works at the company.', measure: '份' },
  { id: 'v-mai', zh: '买', py: 'mǎi', en: 'to buy', hsk: 1, example: '我{买}了三本书。', examplePy: 'Wǒ mǎi le sān běn shū.', exampleEn: 'I bought three books.', collocation: '买东西' },
  { id: 'v-shu', zh: '书', py: 'shū', en: 'book', hsk: 1, example: '我买了三本{书}。', examplePy: 'Wǒ mǎi le sān běn shū.', exampleEn: 'I bought three books.', measure: '本' },
  { id: 'v-gege', zh: '哥哥', py: 'gēge', en: 'older brother', hsk: 1, example: '我有两个{哥哥}。', examplePy: 'Wǒ yǒu liǎng ge gēge.', exampleEn: 'I have two older brothers.', measure: '个' },
  { id: 'v-kuai', zh: '快', py: 'kuài', en: 'fast, quick', hsk: 2, example: '他说得很{快}。', examplePy: 'Tā shuō de hěn kuài.', exampleEn: 'He speaks very fast.', collocation: '很快 / 快点' },
  { id: 'v-zhide', zh: '值得', py: 'zhíde', en: 'to be worth it', hsk: 4, example: '这本书很{值得}看。', examplePy: 'Zhè běn shū hěn zhíde kàn.', exampleEn: 'This book is well worth reading.', collocation: '值得看 / 不值得' },
  { id: 'v-dianying', zh: '电影', py: 'diànyǐng', en: 'film, movie', hsk: 1, example: '我昨天看{电影}。', examplePy: 'Wǒ zuótiān kàn diànyǐng.', exampleEn: 'I watched a film yesterday.', measure: '部' },
  { id: 'v-zhongwen', zh: '中文', py: 'Zhōngwén', en: 'Chinese (language)', hsk: 1, example: '她今天学{中文}。', examplePy: 'Tā jīntiān xué Zhōngwén.', exampleEn: 'She studies Chinese today.' },
  { id: 'v-re', zh: '热', py: 'rè', en: 'hot', hsk: 1, example: '今天很{热}。', examplePy: 'Jīntiān hěn rè.', exampleEn: 'It is hot today.' },
  { id: 'v-tongshi', zh: '同事', py: 'tóngshì', en: 'colleague', hsk: 3, example: '他跟{同事}一起吃饭。', examplePy: 'Tā gēn tóngshì yìqǐ chī fàn.', exampleEn: 'He eats with his colleagues.', measure: '个' },
  { id: 'v-suiran', zh: '虽然', py: 'suīrán', en: 'although', hsk: 3, example: '{虽然}我很累，但是我还要工作。', examplePy: 'Suīrán wǒ hěn lèi, dànshì wǒ hái yào gōngzuò.', exampleEn: 'Although I am tired, I still have to work.', collocation: '虽然…但是…' },
  { id: 'v-xiayu', zh: '下雨', py: 'xià yǔ', en: 'to rain', hsk: 2, example: '因为{下雨}，所以我在家。', examplePy: 'Yīnwèi xià yǔ, suǒyǐ wǒ zài jiā.', exampleEn: 'Because it is raining, I am at home.' },
  { id: 'v-man', zh: '慢', py: 'màn', en: 'slow', hsk: 2, example: '请说得{慢}一点。', examplePy: 'Qǐng shuō de màn yìdiǎn.', exampleEn: 'Please speak a little more slowly.' },
  { id: 'v-cha', zh: '茶', py: 'chá', en: 'tea', hsk: 1, example: '我要三杯{茶}。', examplePy: 'Wǒ yào sān bēi chá.', exampleEn: 'I want three cups of tea.', measure: '杯' },
  { id: 'v-gongsi', zh: '公司', py: 'gōngsī', en: 'company', hsk: 2, example: '他在{公司}工作。', examplePy: 'Tā zài gōngsī gōngzuò.', exampleEn: 'He works at the company.', measure: '家' },
];

export const VOCAB_BY_ID: Record<string, VocabWord> = Object.fromEntries(VOCAB.map((v) => [v.id, v]));

/** The word with its braces stripped, for TTS and for the listening facet. */
export function exampleText(w: VocabWord): string {
  return w.example.replace(/[{}]/g, '');
}
