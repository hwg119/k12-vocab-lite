import { Word } from '../types';

/**
 * 小学英语词库（课标版）- 50 词种子数据
 *
 * 覆盖小学 3-6 年级核心高频词。
 * 完整 400+ 词库按需补入本文件即可，数据结构零改造适配全功能。
 * 格式约束：
 *   - 字段：id / english / phonetic / chinese / stage / difficulty
 *   - 释义极简、贴近小学生认知、不含僻义
 */
export const PRIMARY_WORDS: Word[] = [
  { id: 'wd_a',         english: 'a',         phonetic: '[ə]',          chinese: '一(个); 一个的',         stage: 'primary', difficulty: 1 },
  { id: 'wd_an',        english: 'an',        phonetic: '[ən]',         chinese: '一(个); 用于元音前',     stage: 'primary', difficulty: 1 },
  { id: 'wd_and',       english: 'and',       phonetic: '[ænd]',        chinese: '和, 与',                 stage: 'primary', difficulty: 1 },
  { id: 'wd_apple',     english: 'apple',     phonetic: '[ˈæpl]',       chinese: '苹果',                   stage: 'primary', difficulty: 1, mnemonic: '圆圆的 apple 红又甜' },
  { id: 'wd_bag',       english: 'bag',       phonetic: '[bæɡ]',        chinese: '包; 书包',               stage: 'primary', difficulty: 1, mnemonic: '背(bèi)上 bag 去学校' },
  { id: 'wd_ball',      english: 'ball',      phonetic: '[bɔːl]',       chinese: '球',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_bed',       english: 'bed',       phonetic: '[bed]',        chinese: '床',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_big',       english: 'big',       phonetic: '[bɪɡ]',        chinese: '大的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_book',      english: 'book',      phonetic: '[bʊk]',        chinese: '书; 书本',               stage: 'primary', difficulty: 1 },
  { id: 'wd_boy',       english: 'boy',       phonetic: '[bɔɪ]',        chinese: '男孩',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_bread',     english: 'bread',     phonetic: '[bred]',       chinese: '面包',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_brother',   english: 'brother',   phonetic: '[ˈbrʌðə(r)]',  chinese: '兄; 弟',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_cat',       english: 'cat',       phonetic: '[kæt]',        chinese: '猫',                     stage: 'primary', difficulty: 1, mnemonic: '小猫 cat 喵喵喵' },
  { id: 'wd_chair',     english: 'chair',     phonetic: '[tʃeə(r)]',    chinese: '椅子',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_class',     english: 'class',     phonetic: '[klɑːs]',      chinese: '班级; 课',               stage: 'primary', difficulty: 2 },
  { id: 'wd_cold',      english: 'cold',      phonetic: '[kəʊld]',      chinese: '冷的; 寒冷',             stage: 'primary', difficulty: 2 },
  { id: 'wd_color',     english: 'color',     phonetic: '[ˈkʌlə(r)]',   chinese: '颜色',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_come',      english: 'come',      phonetic: '[kʌm]',        chinese: '来; 到来',               stage: 'primary', difficulty: 2 },
  { id: 'wd_cup',       english: 'cup',       phonetic: '[kʌp]',        chinese: '茶杯; 杯子',             stage: 'primary', difficulty: 1 },
  { id: 'wd_dad',       english: 'dad',       phonetic: '[dæd]',        chinese: '爸爸',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_day',       english: 'day',       phonetic: '[deɪ]',        chinese: '白天; 一日',             stage: 'primary', difficulty: 1 },
  { id: 'wd_dog',       english: 'dog',       phonetic: '[dɒɡ]',        chinese: '狗',                     stage: 'primary', difficulty: 1, mnemonic: '小狗 dog 看家汪汪叫' },
  { id: 'wd_door',      english: 'door',      phonetic: '[dɔː(r)]',     chinese: '门',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_duck',      english: 'duck',      phonetic: '[dʌk]',        chinese: '鸭子',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_egg',       english: 'egg',       phonetic: '[eɡ]',         chinese: '蛋; 鸡蛋',               stage: 'primary', difficulty: 1 },
  { id: 'wd_eight',     english: 'eight',     phonetic: '[eɪt]',        chinese: '八',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_eye',       english: 'eye',       phonetic: '[aɪ]',         chinese: '眼睛',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_face',      english: 'face',      phonetic: '[feɪs]',       chinese: '脸',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_family',    english: 'family',    phonetic: '[ˈfæməli]',    chinese: '家庭; 家人',             stage: 'primary', difficulty: 2 },
  { id: 'wd_father',    english: 'father',    phonetic: '[ˈfɑːðə(r)]',  chinese: '父亲; 爸爸',             stage: 'primary', difficulty: 2 },
  { id: 'wd_fish',      english: 'fish',      phonetic: '[fɪʃ]',        chinese: '鱼; 鱼肉',               stage: 'primary', difficulty: 1 },
  { id: 'wd_five',      english: 'five',      phonetic: '[faɪv]',       chinese: '五',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_four',      english: 'four',      phonetic: '[fɔː(r)]',     chinese: '四',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_friend',    english: 'friend',    phonetic: '[frend]',      chinese: '朋友',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_girl',      english: 'girl',      phonetic: '[ɡɜːl]',       chinese: '女孩',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_good',      english: 'good',      phonetic: '[ɡʊd]',        chinese: '好的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_hand',      english: 'hand',      phonetic: '[hænd]',       chinese: '手',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_happy',     english: 'happy',     phonetic: '[ˈhæpi]',      chinese: '快乐的; 高兴的',         stage: 'primary', difficulty: 2 },
  { id: 'wd_hello',     english: 'hello',     phonetic: '[həˈləʊ]',     chinese: '喂; 你好',               stage: 'primary', difficulty: 1 },
  { id: 'wd_home',      english: 'home',      phonetic: '[həʊm]',       chinese: '家',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_hot',       english: 'hot',       phonetic: '[hɒt]',        chinese: '热的; 辣的',             stage: 'primary', difficulty: 2 },
  { id: 'wd_mother',    english: 'mother',    phonetic: '[ˈmʌðə(r)]',   chinese: '母亲; 妈妈',             stage: 'primary', difficulty: 2 },
  { id: 'wd_milk',      english: 'milk',      phonetic: '[mɪlk]',       chinese: '牛奶',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_nine',      english: 'nine',      phonetic: '[naɪn]',       chinese: '九',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_one',       english: 'one',       phonetic: '[wʌn]',        chinese: '一',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_pen',       english: 'pen',       phonetic: '[pen]',        chinese: '钢笔',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_pencil',    english: 'pencil',    phonetic: '[ˈpensl]',     chinese: '铅笔',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_seven',     english: 'seven',     phonetic: '[ˈsevn]',      chinese: '七',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_six',       english: 'six',       phonetic: '[sɪks]',       chinese: '六',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_teacher',   english: 'teacher',   phonetic: '[ˈtiːtʃə(r)]', chinese: '老师; 教师',             stage: 'primary', difficulty: 2 },
  { id: 'wd_ten',       english: 'ten',       phonetic: '[ten]',        chinese: '十',                     stage: 'primary', difficulty: 1 },
];
