// 提取词库中所有 unique 英文词，输出到控制台（每行一个）
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'data');
const words = new Set();

fs.readdirSync(srcDir).forEach(file => {
  if (!file.endsWith('.ts') || file.endsWith('.test.ts')) return;
  const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  const regex = /english:\s+'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    words.add(match[1].toLowerCase());
  }
});

const sorted = [...words].sort();
sorted.forEach(w => console.log(w));

// 输出统计
console.error(`\nTotal unique words: ${sorted.length}`);