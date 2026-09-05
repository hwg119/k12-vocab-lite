/**
 * 词根词缀分解工具
 *
 * 对英文词做前缀/后缀/词根匹配，返回分解结果。
 * 只做规则匹配，不依赖外部数据。
 */

/** 常见前缀 */
const PREFIXES = [
  { affix: 'un', meaning: '不/非', priority: 1 },
  { affix: 're', meaning: '再/又', priority: 1 },
  { affix: 'pre', meaning: '前/预先', priority: 1 },
  { affix: 'dis', meaning: '不/否定', priority: 1 },
  { affix: 'mis', meaning: '错/误', priority: 1 },
  { affix: 'over', meaning: '过度/上方', priority: 1 },
  { affix: 'under', meaning: '下/不足', priority: 1 },
  { affix: 'out', meaning: '超出/外', priority: 1 },
  { affix: 'en', meaning: '使…', priority: 2 },
  { affix: 'em', meaning: '使…', priority: 2 },
  { affix: 'non', meaning: '非/不', priority: 2 },
  { affix: 'inter', meaning: '相互/之间', priority: 2 },
  { affix: 'trans', meaning: '跨越/转移', priority: 2 },
  { affix: 'super', meaning: '超级/超越', priority: 2 },
  { affix: 'sub', meaning: '下/次/副', priority: 2 },
  { affix: 'semi', meaning: '半', priority: 3 },
  { affix: 'anti', meaning: '反对/抗', priority: 3 },
  { affix: 'counter', meaning: '反/对', priority: 3 },
  { affix: 'fore', meaning: '前/预', priority: 3 },
  { affix: 'co', meaning: '共同/一起', priority: 3 },
  { affix: 'de', meaning: '去/向下/否定', priority: 2 },
  { affix: 'ex', meaning: '前/出/向外', priority: 2 },
  { affix: 'pro', meaning: '向前/赞成', priority: 3 },
  { affix: 'per', meaning: '贯穿/每', priority: 3 },
  { affix: 'im', meaning: '入/不', priority: 2 },
  { affix: 'in', meaning: '入/不', priority: 2 },
  { affix: 'ir', meaning: '不（后接r）', priority: 3 },
  { affix: 'il', meaning: '不（后接l）', priority: 3 },
  { affix: 'multi', meaning: '多', priority: 3 },
  { affix: 'micro', meaning: '微', priority: 3 },
  { affix: 'macro', meaning: '宏/大', priority: 3 },
  { affix: 'post', meaning: '后', priority: 3 },
  { affix: 'extra', meaning: '额外/超出', priority: 3 },
  { affix: 'self', meaning: '自我', priority: 3 },
  { affix: 'step', meaning: '继/后', priority: 3 },
  { affix: 'bi', meaning: '双/二', priority: 3 },
  { affix: 'tri', meaning: '三', priority: 3 },
  { affix: 'tele', meaning: '远/电', priority: 3 },
  { affix: 'auto', meaning: '自己/自动', priority: 3 },
  { affix: 'kilo', meaning: '千', priority: 3 },
  { affix: 'mid', meaning: '中间', priority: 3 },
  { affix: 'mini', meaning: '小', priority: 3 },
  { affix: 'maxi', meaning: '大', priority: 3 },
  { affix: 'mono', meaning: '单一', priority: 3 },
  { affix: 'poly', meaning: '多', priority: 3 },
  { affix: 'pseudo', meaning: '假/伪', priority: 3 },
  { affix: 'vice', meaning: '副', priority: 3 },
  { affix: 'up', meaning: '向上', priority: 3 },
  { affix: 'down', meaning: '向下', priority: 3 },
  { affix: 'a', meaning: '在…/不', priority: 3 },
  { affix: 'ab', meaning: '离开', priority: 3 },
  { affix: 'ad', meaning: '向/加强', priority: 3 },
  { affix: 'be', meaning: '使/在', priority: 3 },
  { affix: 'com', meaning: '共同', priority: 3 },
  { affix: 'con', meaning: '共同/一起', priority: 3 },
  { affix: 'col', meaning: '共同（后接l）', priority: 3 },
  { affix: 'cor', meaning: '共同（后接r）', priority: 3 },
  { affix: 'e', meaning: '出/向外', priority: 3 },
  { affix: 'ef', meaning: '出（后接f）', priority: 3 },
  { affix: 'intro', meaning: '向内/引入', priority: 3 },
  { affix: 'ob', meaning: '逆/反', priority: 3 },
  { affix: 'se', meaning: '分离', priority: 3 },
  { affix: 'sur', meaning: '超过/上', priority: 3 },
  { affix: 'sym', meaning: '共同/相同', priority: 3 },
  { affix: 'syn', meaning: '共同/相同', priority: 3 },
];

/** 常见后缀 */
const SUFFIXES = [
  { affix: 'tion', meaning: '…（名词）', pos: 'n.', priority: 1 },
  { affix: 'sion', meaning: '…（名词）', pos: 'n.', priority: 1 },
  { affix: 'ation', meaning: '…（名词）', pos: 'n.', priority: 1 },
  { affix: 'ition', meaning: '…（名词）', pos: 'n.', priority: 1 },
  { affix: 'able', meaning: '能够…的', pos: 'adj.', priority: 1 },
  { affix: 'ible', meaning: '能够…的', pos: 'adj.', priority: 1 },
  { affix: 'ful', meaning: '充满…的', pos: 'adj.', priority: 1 },
  { affix: 'less', meaning: '没有…的', pos: 'adj.', priority: 1 },
  { affix: 'ly', meaning: '…地（副词）', pos: 'adv.', priority: 1 },
  { affix: 'ment', meaning: '…（行为/结果）', pos: 'n.', priority: 1 },
  { affix: 'ness', meaning: '…（性质/状态）', pos: 'n.', priority: 1 },
  { affix: 'ous', meaning: '…的', pos: 'adj.', priority: 1 },
  { affix: 'al', meaning: '…的', pos: 'adj.', priority: 1 },
  { affix: 'ive', meaning: '…的', pos: 'adj.', priority: 1 },
  { affix: 'er', meaning: '…的人', pos: 'n.', priority: 1 },
  { affix: 'or', meaning: '…的人/物', pos: 'n.', priority: 1 },
  { affix: 'ing', meaning: '…（动名词）', pos: 'v./n.', priority: 2 },
  { affix: 'ed', meaning: '…的（过去式）', pos: 'v.', priority: 2 },
  { affix: 'en', meaning: '使…', pos: 'v.', priority: 2 },
  { affix: 'ize', meaning: '使…化', pos: 'v.', priority: 2 },
  { affix: 'ise', meaning: '使…化', pos: 'v.', priority: 2 },
  { affix: 'ate', meaning: '使…/…的', pos: 'v./adj.', priority: 2 },
  { affix: 'ance', meaning: '…（状态/行为）', pos: 'n.', priority: 2 },
  { affix: 'ence', meaning: '…（状态/行为）', pos: 'n.', priority: 2 },
  { affix: 'ity', meaning: '…（性质）', pos: 'n.', priority: 2 },
  { affix: 'dom', meaning: '…领域/状态', pos: 'n.', priority: 3 },
  { affix: 'ship', meaning: '…关系/状态', pos: 'n.', priority: 3 },
  { affix: 'hood', meaning: '…时期/状态', pos: 'n.', priority: 3 },
  { affix: 'ward', meaning: '向…方向', pos: 'adv.', priority: 3 },
  { affix: 'ist', meaning: '…主义者/…家', pos: 'n.', priority: 3 },
  { affix: 'ism', meaning: '…主义/学说', pos: 'n.', priority: 3 },
  { affix: 'y', meaning: '…的/多…的', pos: 'adj.', priority: 2 },
  { affix: 'ish', meaning: '…似的/稍…的', pos: 'adj.', priority: 3 },
  { affix: 'some', meaning: '产生…的', pos: 'adj.', priority: 3 },
  { affix: 'proof', meaning: '防…的', pos: 'adj.', priority: 3 },
  { affix: 'most', meaning: '最…的', pos: 'adj.', priority: 3 },
  { affix: 'like', meaning: '像…的', pos: 'adj.', priority: 3 },
  { affix: 'th', meaning: '…（抽象名词）', pos: 'n.', priority: 3 },
  { affix: 'ty', meaning: '…（状态）', pos: 'n.', priority: 3 },
  { affix: 'cy', meaning: '…（状态/职位）', pos: 'n.', priority: 3 },
  { affix: 'ual', meaning: '…的', pos: 'adj.', priority: 3 },
  { affix: 'ial', meaning: '…的', pos: 'adj.', priority: 3 },
  { affix: 'ical', meaning: '…的', pos: 'adj.', priority: 3 },
  { affix: 'tive', meaning: '…的', pos: 'adj.', priority: 3 },
  { affix: 'logy', meaning: '…学/研究', pos: 'n.', priority: 3 },
  { affix: 'graphy', meaning: '…学/写法', pos: 'n.', priority: 3 },
  { affix: 'metry', meaning: '…测量学', pos: 'n.', priority: 3 },
  { affix: 'cide', meaning: '杀…', pos: 'n.', priority: 3 },
  { affix: 'phobia', meaning: '恐惧…症', pos: 'n.', priority: 3 },
  { affix: 'mania', meaning: '…狂/癖', pos: 'n.', priority: 3 },
];

/** 常见词根 */
const ROOTS = [
  { affix: 'dict', meaning: '说/言', priority: 1 },
  { affix: 'port', meaning: '搬运/带', priority: 1 },
  { affix: 'spect', meaning: '看', priority: 1 },
  { affix: 'struct', meaning: '建造', priority: 1 },
  { affix: 'tract', meaning: '拉/引', priority: 1 },
  { affix: 'cred', meaning: '相信', priority: 2 },
  { affix: 'aud', meaning: '听', priority: 2 },
  { affix: 'vis', meaning: '看', priority: 2 },
  { affix: 'vid', meaning: '看', priority: 2 },
  { affix: 'mit', meaning: '送/发', priority: 2 },
  { affix: 'miss', meaning: '送/发', priority: 2 },
  { affix: 'duct', meaning: '引导', priority: 2 },
  { affix: 'duc', meaning: '引导', priority: 2 },
  { affix: 'pos', meaning: '放置', priority: 2 },
  { affix: 'scrib', meaning: '写', priority: 2 },
  { affix: 'script', meaning: '写', priority: 2 },
  { affix: 'graph', meaning: '写/图', priority: 2 },
  { affix: 'phone', meaning: '声音', priority: 2 },
  { affix: 'photo', meaning: '光', priority: 2 },
  { affix: 'scope', meaning: '看/观察', priority: 2 },
  { affix: 'bio', meaning: '生命', priority: 2 },
  { affix: 'geo', meaning: '地球/土地', priority: 2 },
  { affix: 'auto', meaning: '自己', priority: 2 },
  { affix: 'cycl', meaning: '圆/循环', priority: 3 },
  { affix: 'ped', meaning: '脚', priority: 3 },
  { affix: 'bene', meaning: '好', priority: 3 },
  { affix: 'mal', meaning: '坏', priority: 3 },
  { affix: 'gen', meaning: '产生/种类', priority: 3 },
  { affix: 'rupt', meaning: '破/断裂', priority: 3 },
  { affix: 'vent', meaning: '来', priority: 3 },
  { affix: 'ven', meaning: '来', priority: 3 },
  { affix: 'volv', meaning: '转/卷', priority: 3 },
  { affix: 'act', meaning: '行动', priority: 3 },
  { affix: 'fac', meaning: '做/制作', priority: 3 },
  { affix: 'fact', meaning: '做/制作', priority: 3 },
  { affix: 'ject', meaning: '投/扔', priority: 3 },
  { affix: 'lect', meaning: '选/讲', priority: 3 },
  { affix: 'leg', meaning: '法律/腿', priority: 3 },
  { affix: 'man', meaning: '手/人', priority: 3 },
  { affix: 'manu', meaning: '手', priority: 3 },
  { affix: 'mob', meaning: '移动', priority: 3 },
  { affix: 'mot', meaning: '移动', priority: 3 },
  { affix: 'mov', meaning: '移动', priority: 3 },
  { affix: 'nat', meaning: '出生/自然', priority: 3 },
  { affix: 'prim', meaning: '第一/最初', priority: 3 },
  { affix: 'publ', meaning: '公众', priority: 3 },
  { affix: 'sens', meaning: '感觉', priority: 3 },
  { affix: 'sent', meaning: '感觉', priority: 3 },
  { affix: 'sequ', meaning: '跟随', priority: 3 },
  { affix: 'secut', meaning: '跟随', priority: 3 },
  { affix: 'serv', meaning: '服务/保存', priority: 3 },
  { affix: 'sign', meaning: '标记', priority: 3 },
  { affix: 'simil', meaning: '相似', priority: 3 },
  { affix: 'soci', meaning: '同伴/社会', priority: 3 },
  { affix: 'sol', meaning: '单独/太阳', priority: 3 },
  { affix: 'spir', meaning: '呼吸', priority: 3 },
  { affix: 'tain', meaning: '拿/保持', priority: 3 },
  { affix: 'ten', meaning: '拿/保持', priority: 3 },
  { affix: 'tend', meaning: '伸展/倾向', priority: 3 },
  { affix: 'tent', meaning: '伸展/倾向', priority: 3 },
  { affix: 'terr', meaning: '土地/地球', priority: 3 },
  { affix: 'test', meaning: '证明/测试', priority: 3 },
  { affix: 'text', meaning: '编织/文本', priority: 3 },
  { affix: 'therm', meaning: '热', priority: 3 },
  { affix: 'tort', meaning: '扭曲', priority: 3 },
  { affix: 'val', meaning: '价值/强', priority: 3 },
  { affix: 'vari', meaning: '变化', priority: 3 },
  { affix: 'verb', meaning: '词语', priority: 3 },
  { affix: 'vers', meaning: '转', priority: 3 },
  { affix: 'vert', meaning: '转', priority: 3 },
  { affix: 'vict', meaning: '征服', priority: 3 },
  { affix: 'vinc', meaning: '征服', priority: 3 },
  { affix: 'voc', meaning: '声音/叫喊', priority: 3 },
  { affix: 'vol', meaning: '意志/自愿', priority: 3 },
  { affix: 'press', meaning: '压', priority: 3 },
  { affix: 'form', meaning: '形状', priority: 3 },
  { affix: 'pose', meaning: '放置', priority: 3 },
  { affix: 'cogn', meaning: '知道', priority: 3 },
  { affix: 'corp', meaning: '身体', priority: 3 },
  { affix: 'dent', meaning: '牙齿', priority: 3 },
  { affix: 'derm', meaning: '皮肤', priority: 3 },
  { affix: 'domin', meaning: '统治', priority: 3 },
  { affix: 'dorm', meaning: '睡眠', priority: 3 },
  { affix: 'equi', meaning: '相等', priority: 3 },
  { affix: 'fract', meaning: '打破', priority: 3 },
  { affix: 'frag', meaning: '打破', priority: 3 },
  { affix: 'grad', meaning: '步/级', priority: 3 },
  { affix: 'gress', meaning: '步/走', priority: 3 },
  { affix: 'grat', meaning: '感谢/高兴', priority: 3 },
  { affix: 'labor', meaning: '劳动', priority: 3 },
  { affix: 'liter', meaning: '文字', priority: 3 },
  { affix: 'loc', meaning: '地方', priority: 3 },
  { affix: 'log', meaning: '话语/思想', priority: 3 },
  { affix: 'loqu', meaning: '说', priority: 3 },
  { affix: 'magn', meaning: '大', priority: 3 },
  { affix: 'memor', meaning: '记忆', priority: 3 },
  { affix: 'ment', meaning: '心智', priority: 3 },
  { affix: 'min', meaning: '小', priority: 3 },
  { affix: 'mir', meaning: '惊奇', priority: 3 },
  { affix: 'morph', meaning: '形状', priority: 3 },
  { affix: 'mort', meaning: '死', priority: 3 },
  { affix: 'nomin', meaning: '名', priority: 3 },
  { affix: 'nov', meaning: '新', priority: 3 },
  { affix: 'numer', meaning: '数', priority: 3 },
  { affix: 'opt', meaning: '选择/最佳', priority: 3 },
  { affix: 'path', meaning: '感情/疾病', priority: 3 },
  { affix: 'patr', meaning: '父亲', priority: 3 },
  { affix: 'pel', meaning: '推/驱动', priority: 3 },
  { affix: 'pens', meaning: '称/付', priority: 3 },
  { affix: 'pend', meaning: '悬挂', priority: 3 },
  { affix: 'pet', meaning: '追求', priority: 3 },
  { affix: 'phil', meaning: '爱', priority: 3 },
  { affix: 'pict', meaning: '画', priority: 3 },
  { affix: 'plen', meaning: '满', priority: 3 },
  { affix: 'plic', meaning: '折叠', priority: 3 },
  { affix: 'popul', meaning: '人/民众', priority: 3 },
  { affix: 'pot', meaning: '力量', priority: 3 },
  { affix: 'psych', meaning: '心灵', priority: 3 },
  { affix: 'punct', meaning: '点/刺', priority: 3 },
  { affix: 'rect', meaning: '直/正', priority: 3 },
  { affix: 'riv', meaning: '河流', priority: 3 },
  { affix: 'rog', meaning: '要求', priority: 3 },
  { affix: 'rot', meaning: '轮/转', priority: 3 },
  { affix: 'sci', meaning: '知', priority: 3 },
  { affix: 'sect', meaning: '切/割', priority: 3 },
  { affix: 'sed', meaning: '坐', priority: 3 },
  { affix: 'sid', meaning: '坐', priority: 3 },
  { affix: 'sess', meaning: '坐', priority: 3 },
  { affix: 'sist', meaning: '站', priority: 3 },
  { affix: 'solv', meaning: '解开', priority: 3 },
  { affix: 'solu', meaning: '解开', priority: 3 },
  { affix: 'son', meaning: '声音', priority: 3 },
  { affix: 'soph', meaning: '智慧', priority: 3 },
  { affix: 'spers', meaning: '散', priority: 3 },
  { affix: 'spond', meaning: '承诺', priority: 3 },
  { affix: 'st', meaning: '站', priority: 3 },
  { affix: 'stat', meaning: '站/静', priority: 3 },
  { affix: 'stitut', meaning: '建立', priority: 3 },
  { affix: 'stinct', meaning: '刺/激发', priority: 3 },
  { affix: 'strict', meaning: '拉紧', priority: 3 },
  { affix: 'suade', meaning: '劝告', priority: 3 },
  { affix: 'sum', meaning: '总/取', priority: 3 },
  { affix: 'sumpt', meaning: '取', priority: 3 },
  { affix: 'tact', meaning: '触', priority: 3 },
  { affix: 'tag', meaning: '触', priority: 3 },
  { affix: 'tang', meaning: '触', priority: 3 },
  { affix: 'tect', meaning: '盖', priority: 3 },
  { affix: 'tempor', meaning: '时间', priority: 3 },
  { affix: 'turb', meaning: '扰乱', priority: 3 },
  { affix: 'umbr', meaning: '阴影', priority: 3 },
  { affix: 'uni', meaning: '一/统一', priority: 3 },
  { affix: 'urb', meaning: '城市', priority: 3 },
  { affix: 'vac', meaning: '空', priority: 3 },
  { affix: 'vad', meaning: '走', priority: 3 },
  { affix: 'vag', meaning: '流浪', priority: 3 },
  { affix: 'van', meaning: '空/前', priority: 3 },
  { affix: 'vapor', meaning: '蒸汽', priority: 3 },
  { affix: 'veh', meaning: '携带', priority: 3 },
  { affix: 'veloc', meaning: '速度', priority: 3 },
  { affix: 'ven', meaning: '来', priority: 3 },
  { affix: 'ver', meaning: '真实', priority: 3 },
  { affix: 'verm', meaning: '虫', priority: 3 },
  { affix: 'vi', meaning: '路', priority: 3 },
  { affix: 'via', meaning: '通过', priority: 3 },
  { affix: 'vig', meaning: '活力', priority: 3 },
  { affix: 'vir', meaning: '男子/力量', priority: 3 },
  { affix: 'viv', meaning: '活', priority: 3 },
  { affix: 'voc', meaning: '声音', priority: 3 },
  { affix: 'vor', meaning: '吃', priority: 3 },
  { affix: 'vot', meaning: '发誓', priority: 3 },
  { affix: 'vulg', meaning: '平民', priority: 3 },
];

export interface AffixResult {
  /** 前缀（如果有） */
  prefix?: { affix: string; meaning: string };
  /** 后缀（如果有） */
  suffix?: { affix: string; meaning: string; pos?: string };
  /** 词根（如果有） */
  root?: { affix: string; meaning: string };
  /** 剩余部分（无匹配的部分） */
  remainder?: string;
}

/**
 * 对英文词做词根词缀分解。
 * 匹配策略：前缀（最长匹配）→ 后缀（最长匹配）→ 词根（在剩余部分里匹配）
 */
export function decomposeWord(word: string): AffixResult | null {
  if (!word || word.length < 3) return null;

  const lower = word.toLowerCase();
  let result: AffixResult = {};

  // 1. 匹配前缀（最长匹配优先）
  const sortedPrefixes = [...PREFIXES].sort((a, b) => b.affix.length - a.affix.length);
  for (const p of sortedPrefixes) {
    if (lower.startsWith(p.affix) && lower.length > p.affix.length + 2) {
      result.prefix = { affix: p.affix, meaning: p.meaning };
      break;
    }
  }

  // 2. 匹配后缀（最长匹配优先，在剩余部分里匹配）
  const sortedSuffixes = [...SUFFIXES].sort((a, b) => b.affix.length - a.affix.length);
  for (const s of sortedSuffixes) {
    const checkLen = result.prefix ? lower.length - result.prefix.affix.length : lower.length;
    if (lower.endsWith(s.affix) && checkLen > s.affix.length + 1) {
      result.suffix = { affix: s.affix, meaning: s.meaning, pos: s.pos };
      break;
    }
  }

  // 3. 匹配词根（在去除前缀和后缀的剩余部分里匹配）
  let start = result.prefix ? result.prefix.affix.length : 0;
  let end = result.suffix ? lower.length - result.suffix.affix.length : lower.length;
  if (start >= end) end = start + 1; // 至少保留一个字符

  const middle = lower.slice(start, end);
  const sortedRoots = [...ROOTS].sort((a, b) => b.affix.length - a.affix.length);
  for (const r of sortedRoots) {
    if (middle.includes(r.affix)) {
      result.root = { affix: r.affix, meaning: r.meaning };
      break;
    }
  }

  // 4. 剩余部分
  const rootStart = result.root ? middle.indexOf(result.root.affix) : -1;
  const rootEnd = rootStart >= 0 ? rootStart + result.root!.affix.length : -1;
  let parts: string[] = [];
  if (result.prefix) parts.push(result.prefix.affix);
  if (result.root && rootStart >= 0 && rootStart < middle.length) {
    const beforeRoot = middle.slice(0, rootStart);
    if (beforeRoot) parts.push(beforeRoot);
    parts.push(result.root.affix);
    const afterRoot = middle.slice(rootEnd);
    if (afterRoot) parts.push(afterRoot);
  } else if (middle) {
    parts.push(middle);
  }
  if (result.suffix) parts.push(result.suffix.affix);
  result.remainder = parts.join('+');

  // 至少有两部分匹配才返回结果（避免只有前缀/后缀的噪音）
  const matchedCount = (result.prefix ? 1 : 0) + (result.root ? 1 : 0) + (result.suffix ? 1 : 0);
  if (matchedCount < 2) return null;

  return result;
}