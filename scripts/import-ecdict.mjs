// 从 ECDICT csv 中提取中考(zk)、高考(gk)词汇，生成 junior.ts / senior.ts
// 使用简单的状态机解析 CSV（处理引号内的换行和逗号）
import { readFileSync, writeFileSync } from 'fs';

const csv = readFileSync('_ecdict/ecdict.csv', 'utf8');

// ---- 简易 CSV 解析（支持引号、转义、字段内换行） ----
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

console.log('Parsing CSV...');
const rows = parseCSV(csv);
const header = rows[0];
const idx = {
  word: header.indexOf('word'),
  phonetic: header.indexOf('phonetic'),
  translation: header.indexOf('translation'),
  tag: header.indexOf('tag'),
  collins: header.indexOf('collins'),
  bnc: header.indexOf('bnc'),
  frq: header.indexOf('frq'),
};
console.log('Header:', JSON.stringify(idx));
console.log('Total rows:', rows.length - 1);

// 过滤：必须同时有 word 和 translation
function cleanTranslation(s) {
  if (!s) return '';
  return s
    .replace(/\\n/g, '；')
    .replace(/\n/g, '；')
    .replace(/\s+/g, ' ')
    .trim();
}
function cleanPhonetic(s) {
  if (!s) return '';
  s = s.trim().replace(/\^/g, 'g');
  if (!s) return '';
  if (!s.startsWith('[')) s = '[' + s;
  if (!s.endsWith(']')) s = s + ']';
  return s;
}
// 截短过长释义：只取前两个分号段，超长再截断
function trimTranslation(s) {
  if (!s) return '';
  const parts = s.split(/[；;]/).map(p => p.trim()).filter(Boolean);
  let out = parts.slice(0, 2).join('；');
  if (out.length > 40) out = out.slice(0, 40) + '…';
  return out;
}

const zkWords = [];
const gkWords = [];
const seenWords = new Set();

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length < header.length) continue;
  const word = (row[idx.word] || '').trim().toLowerCase();
  const translation = trimTranslation(cleanTranslation(row[idx.translation] || ''));
  const tag = row[idx.tag] || '';
  if (!word || !translation) continue;
  // 过滤异常 bnc 值（0 或负数视为无效，用大数代替）
  let bnc = parseInt(row[idx.bnc] || '99999', 10);
  if (!bnc || bnc <= 0) bnc = 99999;
  if (seenWords.has(word)) continue;
  seenWords.add(word);

  const phonetic = cleanPhonetic(row[idx.phonetic] || '');
  const collins = parseInt(row[idx.collins] || '0', 10);
  const frq = parseInt(row[idx.frq] || '99999', 10);

  // difficulty 计算：结合 collins 星级和 BNC 词频
  // collins 5=最常用, 1=少见; bnc 越小越常用
  let difficulty;
  if (collins >= 5 || bnc <= 1000) difficulty = 1;
  else if (collins === 4 || bnc <= 3000) difficulty = 2;
  else if (collins === 3 || bnc <= 8000) difficulty = 3;
  else if (collins === 2 || bnc <= 15000) difficulty = 4;
  else difficulty = 5;

  const base = { word, phonetic, translation, difficulty, collins, bnc, frq, tag };

  if (tag.includes('zk')) zkWords.push(base);
  if (tag.includes('gk')) gkWords.push(base);
}

console.log(`zk: ${zkWords.length}, gk: ${gkWords.length}`);

// ---- 生成 junior.ts ----
function genTs(stageName, stageLabel, words, comment) {
  const lines = [];
  lines.push(`import { Word } from '../types';`);
  lines.push('');
  lines.push(`/**`);
  lines.push(` * ${stageLabel}词库 - ${words.length} 词`);
  lines.push(` *`);
  lines.push(` * 数据来源：ECDICT (https://github.com/skywind3000/ECDICT) `);
  lines.push(` * 筛选条件：tag 含 '${comment}'`);
  lines.push(` * 字段：id / english / phonetic / chinese / stage / difficulty`);
  lines.push(` */`);
  lines.push(`export const ${stageName.toUpperCase()}_WORDS: Word[] = [`);
  // 按 difficulty 升序、bnc 升序排序（高频在前）
  words.sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return a.bnc - b.bnc;
  });
  words.forEach((w, i) => {
    const id = `wd_${stageName}_${String(i + 1).padStart(4, '0')}`;
    const english = w.word.replace(/'/g, "\\'");
    const phonetic = w.phonetic.replace(/'/g, "\\'");
    const chinese = w.translation.replace(/'/g, "\\'");
    lines.push(`  { id: '${id}', english: '${english}', phonetic: '${phonetic}', chinese: '${chinese}', stage: '${stageName}', difficulty: ${w.difficulty} },`);
  });
  lines.push(`];`);
  return lines.join('\n');
}

const juniorTs = genTs('junior', '初中（中考）', zkWords, 'zk');
writeFileSync('src/data/junior.ts', juniorTs, 'utf8');
console.log(`Written src/data/junior.ts (${zkWords.length} words)`);

// 小学词库：ECDICT 没有专门的「小学」tag
// 策略：保留现有 primary.ts（人工精选的 403 词，更适合小学生认知）
// 不自动覆盖，避免引入过于宽泛或冷僻的词
console.log('Primary unchanged');

// 高中词库：用 ECDICT 的 gk 标签覆盖现有（3677 vs 现有 3815，量级相当且数据更规范）
const seniorTs = genTs('senior', '高中（高考）', gkWords, 'gk');
writeFileSync('src/data/senior.ts', seniorTs, 'utf8');
console.log(`Written src/data/senior.ts (${gkWords.length} words)`);

console.log('Done.');
