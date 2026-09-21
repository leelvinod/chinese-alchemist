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
  { id: 'v-xuesheng', zh: '学生', py: 'xuésheng', en: 'student', hsk: 1, example: '我是{学生}。', examplePy: 'Wǒ shì xuésheng.', exampleEn: 'I am a student.', measure: '个' },
  { id: 'v-laoshi', zh: '老师', py: 'lǎoshī', en: 'teacher', hsk: 1, example: '他是{老师}。', examplePy: 'Tā shì lǎoshī.', exampleEn: 'He is a teacher.', measure: '位' },
  { id: 'v-shi', zh: '是', py: 'shì', en: 'to be', hsk: 1, example: '我{是}学生。', examplePy: 'Wǒ shì xuésheng.', exampleEn: 'I am a student.', collocation: '是…的' },
  { id: 'v-ma', zh: '吗', py: 'ma', en: '(question particle)', hsk: 1, example: '你是老师{吗}？', examplePy: 'Nǐ shì lǎoshī ma?', exampleEn: 'Are you a teacher?' },
  { id: 'v-bu', zh: '不', py: 'bù', en: 'not', hsk: 1, example: '我明天{不}去。', examplePy: 'Wǒ míngtiān bú qù.', exampleEn: 'I am not going tomorrow.', collocation: '不去 / 不是' },
  { id: 'v-mei', zh: '没', py: 'méi', en: 'did not, have not', hsk: 2, example: '我昨天{没}去。', examplePy: 'Wǒ zuótiān méi qù.', exampleEn: 'I did not go yesterday.', collocation: '没有 / 没去' },
  { id: 'v-de', zh: '的', py: 'de', en: "(possessive particle)", hsk: 1, example: '这是我{的}书。', examplePy: 'Zhè shì wǒ de shū.', exampleEn: 'This is my book.' },
  { id: 'v-zhe', zh: '这', py: 'zhè', en: 'this', hsk: 1, example: '{这}是我的家。', examplePy: 'Zhè shì wǒ de jiā.', exampleEn: 'This is my home.' },
  { id: 'v-zhongguo', zh: '中国', py: 'Zhōngguó', en: 'China', hsk: 1, example: '我去过{中国}。', examplePy: 'Wǒ qù guo Zhōngguó.', exampleEn: 'I have been to China.' },
  { id: 'v-guo', zh: '过', py: 'guo', en: '(have done it before)', hsk: 3, example: '我去{过}中国。', examplePy: 'Wǒ qù guo Zhōngguó.', exampleEn: 'I have been to China.' },
  { id: 'v-bi', zh: '比', py: 'bǐ', en: 'than, compared with', hsk: 3, example: '他{比}我高。', examplePy: 'Tā bǐ wǒ gāo.', exampleEn: 'He is taller than me.', collocation: 'A 比 B + adjective' },
  { id: 'v-gao', zh: '高', py: 'gāo', en: 'tall, high', hsk: 2, example: '他比我{高}。', examplePy: 'Tā bǐ wǒ gāo.', exampleEn: 'He is taller than me.' },
  { id: 'v-mang', zh: '忙', py: 'máng', en: 'busy', hsk: 2, example: '你今天{忙}吗？', examplePy: 'Nǐ jīntiān máng ma?', exampleEn: 'Are you busy today?', collocation: '很忙 / 太忙了' },
  { id: 'v-ba', zh: '把', py: 'bǎ', en: '(moves the object in front of the verb)', hsk: 4, example: '我{把}书放在桌子上。', examplePy: 'Wǒ bǎ shū fàng zài zhuōzi shàng.', exampleEn: 'I put the book on the table.' },
  { id: 'v-fang', zh: '放', py: 'fàng', en: 'to put, to place', hsk: 3, example: '我把书{放}在桌子上。', examplePy: 'Wǒ bǎ shū fàng zài zhuōzi shàng.', exampleEn: 'I put the book on the table.' },
  { id: 'v-wan', zh: '完', py: 'wán', en: 'to finish', hsk: 2, example: '他把饭吃{完}了。', examplePy: 'Tā bǎ fàn chī wán le.', exampleEn: 'He finished the food.', collocation: '吃完 / 看完' },
  { id: 'v-ruguo', zh: '如果', py: 'rúguǒ', en: 'if', hsk: 3, example: '{如果}下雨，我就不去。', examplePy: 'Rúguǒ xià yǔ, wǒ jiù bú qù.', exampleEn: 'If it rains, I will not go.', collocation: '如果…就…' },
  { id: 'v-jiu', zh: '就', py: 'jiù', en: 'then, right away', hsk: 2, example: '如果你来，我{就}做饭。', examplePy: 'Rúguǒ nǐ lái, wǒ jiù zuò fàn.', exampleEn: 'If you come, I will cook.' },
  { id: 'v-zuofan', zh: '做饭', py: 'zuò fàn', en: 'to cook', hsk: 2, example: '如果你来，我就{做饭}。', examplePy: 'Rúguǒ nǐ lái, wǒ jiù zuò fàn.', exampleEn: 'If you come, I will cook.', split: '做过一次饭' },
  { id: 'v-lai', zh: '来', py: 'lái', en: 'to come', hsk: 1, example: '他昨天{来}了。', examplePy: 'Tā zuótiān lái le.', exampleEn: 'He came yesterday.' },
  { id: 'v-xue', zh: '学', py: 'xué', en: 'to study, to learn', hsk: 1, example: '她今天{学}中文。', examplePy: 'Tā jīntiān xué Zhōngwén.', exampleEn: 'She studies Chinese today.', collocation: '学中文 / 学会' },
  { id: 'v-yiqi', zh: '一起', py: 'yìqǐ', en: 'together', hsk: 2, example: '我跟朋友{一起}去。', examplePy: 'Wǒ gēn péngyou yìqǐ qù.', exampleEn: 'I am going with a friend.', collocation: '跟…一起' },
  { id: 'v-gen', zh: '跟', py: 'gēn', en: 'with', hsk: 2, example: '我{跟}朋友一起去。', examplePy: 'Wǒ gēn péngyou yìqǐ qù.', exampleEn: 'I am going with a friend.' },
  { id: 'v-zaijia', zh: '在', py: 'zài', en: 'at, in', hsk: 1, example: '我{在}家吃饭。', examplePy: 'Wǒ zài jiā chī fàn.', exampleEn: 'I eat at home.', collocation: '在家 / 在公司' },
  { id: 'v-kan', zh: '看', py: 'kàn', en: 'to look, to watch, to read', hsk: 1, example: '我昨天{看}电影。', examplePy: 'Wǒ zuótiān kàn diànyǐng.', exampleEn: 'I watched a film yesterday.', collocation: '看书 / 看电影' },
  { id: 'v-you', zh: '有', py: 'yǒu', en: 'to have', hsk: 1, example: '我{有}两个哥哥。', examplePy: 'Wǒ yǒu liǎng ge gēge.', exampleEn: 'I have two older brothers.' },
  { id: 'v-yao', zh: '要', py: 'yào', en: 'to want, to need', hsk: 2, example: '我{要}三杯茶。', examplePy: 'Wǒ yào sān bēi chá.', exampleEn: 'I want three cups of tea.' },
  { id: 'v-shuo', zh: '说', py: 'shuō', en: 'to speak, to say', hsk: 1, example: '他{说}得很快。', examplePy: 'Tā shuō de hěn kuài.', exampleEn: 'He speaks very fast.', collocation: '说中文 / 说得好' },
  { id: 'v-xie', zh: '写', py: 'xiě', en: 'to write', hsk: 1, example: '我{写}得不好。', examplePy: 'Wǒ xiě de bù hǎo.', exampleEn: 'I write badly.' },
  { id: 'v-hao', zh: '好', py: 'hǎo', en: 'good', hsk: 1, example: '他的中文很{好}。', examplePy: 'Tā de Zhōngwén hěn hǎo.', exampleEn: 'His Chinese is very good.' },
  { id: 'v-yinwei', zh: '因为', py: 'yīnwèi', en: 'because', hsk: 2, example: '{因为}下雨，所以我在家。', examplePy: 'Yīnwèi xià yǔ, suǒyǐ wǒ zài jiā.', exampleEn: 'Because it is raining, I am at home.', collocation: '因为…所以…' },
  { id: 'v-suoyi', zh: '所以', py: 'suǒyǐ', en: 'therefore, so', hsk: 2, example: '因为下雨，{所以}我在家。', examplePy: 'Yīnwèi xià yǔ, suǒyǐ wǒ zài jiā.', exampleEn: 'Because it is raining, I am at home.' },
  { id: 'v-danshi', zh: '但是', py: 'dànshì', en: 'but', hsk: 2, example: '虽然我很累，{但是}我还要工作。', examplePy: 'Suīrán wǒ hěn lèi, dànshì wǒ hái yào gōngzuò.', exampleEn: 'Although I am tired, I still have to work.', collocation: '虽然…但是…' },
  { id: 'v-hai', zh: '还', py: 'hái', en: 'still, also', hsk: 2, example: '我{还}要工作。', examplePy: 'Wǒ hái yào gōngzuò.', exampleEn: 'I still have to work.' },
  { id: 'v-zhidao', zh: '知道', py: 'zhīdào', en: 'to know', hsk: 2, example: '我{知道}他的名字。', examplePy: 'Wǒ zhīdào tā de míngzi.', exampleEn: "I know his name.", collocation: '不知道' },
];


export const VOCAB_BY_ID: Record<string, VocabWord> = Object.fromEntries(VOCAB.map((v) => [v.id, v]));

/** The word with its braces stripped, for TTS and for the listening facet. */
export function exampleText(w: VocabWord): string {
  return w.example.replace(/[{}]/g, '');
}