/* Mandarin Mitra — per-character readings.
   The grader needs to compare what the learner said with what was wanted at the
   level of syllables, not characters: two sentences can use different characters
   and still be the same sounds with a different tone, which is a tone error and
   not a vocabulary one. Splitting a chunk's pinyin string is unreliable
   (gēn péngyou is three characters in two tokens), so readings are held per
   character here. Every character used in the content has an entry; the content
   tests fail if one is missing. */

/** Toneless syllable plus tone number, 1–4, or 5 for the neutral tone. */
export interface Reading {
  base: string;
  tone: number;
}

/* A character's most common reading in the contexts this content uses. Where a
   character is genuinely two words (得 de / děi, 还 hái / huán), the reading that
   matches this content's usage is the one recorded. */
const RAW: Record<string, string> = {
  数: 'shu4', 树: 'shu4', 盲: 'mang2', 至: 'zhi4', 芒: 'mang2', 茫: 'mang2', 输: 'shu1',
  位: 'wei4',
  子: 'zi5',
  爸: 'ba4', 妈: 'ma1',
  /* Readings for every character the content uses, plus the common ones the
     content team will reach for next. One entry per character: the content
     tests fail if a character in the content has no reading here. */
  一: 'yi1', 三: 'san1', 下: 'xia4', 不: 'bu4', 且: 'qie3', 东: 'dong1',
  两: 'liang3', 个: 'ge5', 中: 'zhong1', 为: 'wei4', 久: 'jiu3', 么: 'me5',
  书: 'shu1', 买: 'mai3', 了: 'le5', 事: 'shi4', 人: 'ren2', 今: 'jin1',
  他: 'ta1', 以: 'yi3', 们: 'men5', 份: 'fen4', 伯: 'bo2', 但: 'dan4',
  作: 'zuo4', 你: 'ni3', 值: 'zhi2', 假: 'jia3', 儿: 'er2', 公: 'gong1',
  再: 'zai4', 写: 'xie3', 出: 'chu1', 到: 'dao4', 加: 'jia1', 包: 'bao1',
  北: 'bei3', 医: 'yi1', 去: 'qu4', 友: 'you3', 叔: 'shu1', 可: 'ke3',
  台: 'tai2', 司: 'si1', 吃: 'chi1', 同: 'tong2', 名: 'ming2', 吗: 'ma5',
  吧: 'ba5', 周: 'zhou1', 和: 'he2', 哥: 'ge1', 哪: 'na3', 四: 'si4',
  因: 'yin1', 园: 'yuan2', 在: 'zai4', 坐: 'zuo4', 外: 'wai4', 大: 'da4',
  天: 'tian1', 太: 'tai4', 奶: 'nai3', 她: 'ta1', 好: 'hao3', 如: 'ru2',
  妹: 'mei4', 姐: 'jie3', 姑: 'gu1', 姨: 'yi2', 婆: 'po2', 学: 'xue2',
  客: 'ke4', 家: 'jia1', 对: 'dui4', 就: 'jiu4', 工: 'gong1', 差: 'cha4',
  师: 'shi1', 弟: 'di4', 影: 'ying3', 很: 'hen3', 得: 'de5', 心: 'xin1',
  忙: 'mang2', 快: 'kuai4', 怎: 'zen3', 您: 'nin2', 慢: 'man4', 我: 'wo3',
  所: 'suo3', 找: 'zhao3', 拍: 'pai1', 摘: 'zhai1', 文: 'wen2', 既: 'ji4',
  时: 'shi2', 明: 'ming2', 星: 'xing1', 昨: 'zuo2', 是: 'shi4', 最: 'zui4',
  有: 'you3', 朋: 'peng2', 末: 'mo4', 本: 'ben3', 来: 'lai2', 杯: 'bei1',
  果: 'guo3', 样: 'yang4', 次: 'ci4', 民: 'min2', 气: 'qi4', 汉: 'han4',
  满: 'man3', 点: 'dian3', 烦: 'fan2', 热: 're4', 然: 'ran2', 爷: 'ye2',
  电: 'dian4', 白: 'bai2', 的: 'de5', 看: 'kan4', 瞒: 'man2', 知: 'zhi1',
  累: 'lei4', 绿: 'lv4', 老: 'lao3', 考: 'kao3', 而: 'er2', 舅: 'jiu4',
  茶: 'cha2', 菜: 'cai4', 虽: 'sui1', 街: 'jie1', 西: 'xi1', 要: 'yao4',
  见: 'jian4', 觉: 'jue2', 记: 'ji4', 语: 'yu3', 说: 'shuo1', 请: 'qing3',
  谢: 'xie4', 走: 'zou3', 起: 'qi3', 跟: 'gen1', 路: 'lu4', 过: 'guo4',
  近: 'jin4', 还: 'hai2', 这: 'zhe4', 部: 'bu4', 都: 'dou1', 问: 'wen4',
  间: 'jian1', 院: 'yuan4', 雨: 'yu3', 面: 'mian4', 饭: 'fan4', 高: 'gao1',
  鸡: 'ji1', 麻: 'ma2', 道: 'dao4', 会: 'hui4', 能: 'neng2', 想: 'xiang3',
  用: 'yong4', 给: 'gei3', 做: 'zuo4', 让: 'rang4', 把: 'ba3', 被: 'bei4',
  比: 'bi3', 更: 'geng4', 非: 'fei1', 常: 'chang2', 真: 'zhen1', 正: 'zheng4',
  已: 'yi3', 经: 'jing1', 刚: 'gang1', 才: 'cai2', 先: 'xian1', 后: 'hou4',
  前: 'qian2', 上: 'shang4', 里: 'li3', 边: 'bian1', 多: 'duo1', 少: 'shao3',
  几: 'ji3', 些: 'xie1', 每: 'mei3', 年: 'nian2', 月: 'yue4', 日: 'ri4',
  号: 'hao4', 分: 'fen1', 钟: 'zhong1', 早: 'zao3', 晚: 'wan3', 午: 'wu3',
  夜: 'ye4', 五: 'wu3', 六: 'liu4', 七: 'qi1', 八: 'ba1', 九: 'jiu3',
  十: 'shi2', 百: 'bai3', 千: 'qian1', 万: 'wan4', 块: 'kuai4', 元: 'yuan2',
  钱: 'qian2', 贵: 'gui4', 便: 'pian2', 宜: 'yi2', 新: 'xin1', 旧: 'jiu4',
  难: 'nan2', 容: 'rong2', 易: 'yi4', 开: 'kai1', 关: 'guan1', 始: 'shi3',
  完: 'wan2', 住: 'zhu4', 睡: 'shui4', 床: 'chuang2', 洗: 'xi3', 穿: 'chuan1',
  衣: 'yi1', 服: 'fu2', 鞋: 'xie2', 手: 'shou3', 机: 'ji1', 脑: 'nao3',
  车: 'che1', 火: 'huo3', 飞: 'fei1', 船: 'chuan2', 站: 'zhan4', 票: 'piao4',
  行: 'xing2', 旅: 'lv3', 游: 'you2', 玩: 'wan2', 饿: 'e4', 渴: 'ke3',
  病: 'bing4', 药: 'yao4', 生: 'sheng1', 死: 'si3', 疼: 'teng2', 舒: 'shu1',
  冷: 'leng3', 暖: 'nuan3', 风: 'feng1', 雪: 'xue3', 阴: 'yin1', 晴: 'qing2',
  春: 'chun1', 夏: 'xia4', 秋: 'qiu1', 冬: 'dong1', 季: 'ji4', 城: 'cheng2',
  市: 'shi4', 国: 'guo2', 省: 'sheng3', 村: 'cun1', 房: 'fang2', 屋: 'wu1',
  门: 'men2', 窗: 'chuang1', 桌: 'zhuo1', 椅: 'yi3', 灯: 'deng1', 水: 'shui3',
  酒: 'jiu3', 咖: 'ka1', 啡: 'fei1', 牛: 'niu2', 肉: 'rou4', 鱼: 'yu2',
  蛋: 'dan4', 米: 'mi3', 汤: 'tang1', 甜: 'tian2', 辣: 'la4', 酸: 'suan1',
  咸: 'xian2', 味: 'wei4', 香: 'xiang1', 口: 'kou3', 话: 'hua4', 字: 'zi4',
  读: 'du2', 听: 'ting1', 懂: 'dong3', 教: 'jiao1', 习: 'xi2', 校: 'xiao4',
  班: 'ban1', 课: 'ke4', 题: 'ti2', 试: 'shi4', 业: 'ye4', 理: 'li3',
  员: 'yuan2', 议: 'yi4', 打: 'da3', 接: 'jie1', 送: 'song4', 带: 'dai4',
  拿: 'na2', 放: 'fang4', 停: 'ting2', 等: 'deng3', 忘: 'wang4', 帮: 'bang1',
  助: 'zhu4', 谈: 'tan2', 希: 'xi1', 望: 'wang4', 决: 'jue2', 定: 'ding4',
  需: 'xu1', 应: 'ying1', 该: 'gai1', 必: 'bi4', 须: 'xu1', 许: 'xu3',
  意: 'yi4', 思: 'si1', 感: 'gan3', 兴: 'xing4', 趣: 'qu4', 喜: 'xi3',
  欢: 'huan1', 爱: 'ai4', 怕: 'pa4', 急: 'ji2', 别: 'bie2', 没: 'mei2',
  未: 'wei4', 无: 'wu2', 只: 'zhi3', 又: 'you4', 也: 'ye3', 直: 'zhi2',
  从: 'cong2', 向: 'xiang4', 往: 'wang3', 离: 'li2', 于: 'yu2', 与: 'yu3',
  或: 'huo4', 者: 'zhe3', 即: 'ji2', 使: 'shi3', 并: 'bing4', 却: 'que4',
  倒: 'dao4',
};

export const READINGS: Record<string, Reading> = Object.fromEntries(
  Object.entries(RAW).map(([zh, raw]) => {
    const tone = Number(raw.slice(-1));
    return [zh, { base: raw.slice(0, -1), tone: Number.isFinite(tone) ? tone : 5 }];
  }),
);

export const readingOf = (zh: string): Reading | undefined => READINGS[zh];

/** Every character of a string, with its reading where we know it. */
export function readingsOf(zh: string): (Reading & { zh: string })[] {
  return [...zh].flatMap((ch) => {
    const r = READINGS[ch];
    return r ? [{ zh: ch, ...r }] : [];
  });
}

/** True when the string is made only of characters we can read. */
export const fullyReadable = (zh: string): boolean =>
  [...zh].every((ch) => !(ch >= '一' && ch <= '鿿') || !!READINGS[ch]);

/* ── sound-level relationships, for coarse pronunciation feedback ──────── */

/** Aspiration pairs — the contrast Hindi has and English lacks. */
const ASPIRATION: [string, string][] = [
  ['b', 'p'],
  ['d', 't'],
  ['g', 'k'],
  ['j', 'q'],
  ['z', 'c'],
  ['zh', 'ch'],
];

/** Retroflex vs dental — zh/z, ch/c, sh/s, and r. */
const RETROFLEX: [string, string][] = [
  ['zh', 'z'],
  ['ch', 'c'],
  ['sh', 's'],
  ['r', 'l'],
];

/** Split a toneless syllable into initial and final. */
export function splitSyllable(base: string): { initial: string; final: string } {
  const two = base.slice(0, 2);
  if (two === 'zh' || two === 'ch' || two === 'sh') {
    return { initial: two, final: base.slice(2) };
  }
  const one = base[0] ?? '';
  if (one && 'bpmfdtnlgkhjqxrzcswy'.includes(one) && base.length > 1) {
    return { initial: one, final: base.slice(1) };
  }
  return { initial: '', final: base };
}

export type SoundDiff = 'nasal' | 'aspiration' | 'retroflex' | 'other';

/** How two toneless syllables differ, when they differ at all. */
export function soundDiff(want: string, got: string): SoundDiff | null {
  if (want === got) return null;

  const w = splitSyllable(want);
  const g = splitSyllable(got);

  // -n against -ng, with the same initial: the Hindi bindu habit.
  if (w.initial === g.initial) {
    const a = w.final;
    const b = g.final;
    if (a === `${b}g` || b === `${a}g`) return 'nasal';
  }

  if (w.final === g.final) {
    const pair = (list: [string, string][]) =>
      list.some(([x, y]) => (w.initial === x && g.initial === y) || (w.initial === y && g.initial === x));
    if (pair(ASPIRATION)) return 'aspiration';
    if (pair(RETROFLEX)) return 'retroflex';
  }

  return 'other';
}
