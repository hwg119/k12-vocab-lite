import { Word } from '../types';

/**
 * 小学英语词库（人教版/外研版课标版）- 约 420 词
 *
 * 覆盖小学 3-6 年级核心高频词。释义极简、贴近小学生认知、不含僻义。
 * 字段：
 *   - id / english / phonetic / chinese
 *   - stage: 固定 'primary'
 *   - difficulty: 1-2（最常用） / 3（次常用） / 4-5（高级）
 *   - mnemonic: 仅对易记错词添加
 */
export const PRIMARY_WORDS: Word[] = [
  // ============================================================
  // 1. 字母 + 数字 (基础)
  // ============================================================
  { id: 'wd_a',         english: 'a',         phonetic: '[ə]',          chinese: '一(个); 一个的',         stage: 'primary', difficulty: 1 },
  { id: 'wd_an',        english: 'an',        phonetic: '[ən]',         chinese: '一(个); 用于元音前',     stage: 'primary', difficulty: 1 },
  { id: 'wd_the',       english: 'the',       phonetic: '[ðə]',         chinese: '这个, 那(些)',           stage: 'primary', difficulty: 1 },
  { id: 'wd_one',       english: 'one',       phonetic: '[wʌn]',        chinese: '一',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_two',       english: 'two',       phonetic: '[tuː]',        chinese: '二',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_three',     english: 'three',     phonetic: '[θriː]',       chinese: '三',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_four',      english: 'four',      phonetic: '[fɔː(r)]',     chinese: '四',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_five',      english: 'five',      phonetic: '[faɪv]',       chinese: '五',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_six',       english: 'six',       phonetic: '[sɪks]',       chinese: '六',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_seven',     english: 'seven',     phonetic: '[ˈsevn]',      chinese: '七',                     stage: 'primary', difficulty: 2, mnemonic: '单词含七个字母' },
  { id: 'wd_eight',     english: 'eight',     phonetic: '[eɪt]',        chinese: '八',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_nine',      english: 'nine',      phonetic: '[naɪn]',       chinese: '九',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_ten',       english: 'ten',       phonetic: '[ten]',        chinese: '十',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_eleven',    english: 'eleven',    phonetic: '[ɪˈlevn]',     chinese: '十一',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_twelve',    english: 'twelve',    phonetic: '[twelv]',      chinese: '十二',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_thirteen',  english: 'thirteen',  phonetic: '[ˌθɜːˈtiːn]',  chinese: '十三',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_fifteen',   english: 'fifteen',   phonetic: '[ˌfɪfˈtiːn]',  chinese: '十五',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_twenty',    english: 'twenty',    phonetic: '[ˈtwenti]',    chinese: '二十',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_thirty',    english: 'thirty',    phonetic: '[ˈθɜːti]',    chinese: '三十',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_fifty',     english: 'fifty',     phonetic: '[ˈfɪfti]',     chinese: '五十',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_hundred',   english: 'hundred',   phonetic: '[ˈhʌndrəd]',   chinese: '百',                     stage: 'primary', difficulty: 5 },
  { id: 'wd_first',     english: 'first',     phonetic: '[fɜːst]',      chinese: '第一',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_second',    english: 'second',    phonetic: '[ˈsekənd]',    chinese: '第二; 秒',               stage: 'primary', difficulty: 3 },
  { id: 'wd_third',     english: 'third',     phonetic: '[θɜːd]',       chinese: '第三',                   stage: 'primary', difficulty: 3 },

  // ============================================================
  // 2. 问候 + 礼貌
  // ============================================================
  { id: 'wd_and',       english: 'and',       phonetic: '[ænd]',        chinese: '和, 与',                 stage: 'primary', difficulty: 1 },
  { id: 'wd_but',        english: 'but',       phonetic: '[bʌt]',        chinese: '但是',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_or',         english: 'or',        phonetic: '[ɔː(r)]',      chinese: '或者',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_hello',     english: 'hello',     phonetic: '[həˈləʊ]',     chinese: '喂, 你好',               stage: 'primary', difficulty: 1 },
  { id: 'wd_hi',         english: 'hi',        phonetic: '[haɪ]',        chinese: '嗨, 你好',               stage: 'primary', difficulty: 1 },
  { id: 'wd_goodbye',   english: 'goodbye',   phonetic: '[ɡʊdˈbaɪ]',    chinese: '再见',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_bye',       english: 'bye',       phonetic: '[baɪ]',        chinese: '再见',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_thank',     english: 'thank',     phonetic: '[θæŋk]',       chinese: '感谢; 谢谢',             stage: 'primary', difficulty: 1 },
  { id: 'wd_thanks',    english: 'thanks',    phonetic: '[θæŋks]',      chinese: '谢谢',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_sorry',     english: 'sorry',     phonetic: '[ˈsɒri]',      chinese: '对不起, 抱歉',           stage: 'primary', difficulty: 1 },
  { id: 'wd_please',    english: 'please',    phonetic: '[pliːz]',      chinese: '请',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_excuse',    english: 'excuse',    phonetic: '[ɪkˈskjuːz]',  chinese: '原谅, 打扰一下',         stage: 'primary', difficulty: 3 },
  { id: 'wd_yes',       english: 'yes',       phonetic: '[jes]',        chinese: '是, 是的',               stage: 'primary', difficulty: 1 },
  { id: 'wd_no',        english: 'no',        phonetic: '[nəʊ]',        chinese: '不, 不是',               stage: 'primary', difficulty: 1 },
  { id: 'wd_ok',        english: 'OK',        phonetic: '[ˌəʊˈkeɪ]',    chinese: '好, 可以',               stage: 'primary', difficulty: 1 },
  { id: 'wd_morning',   english: 'morning',   phonetic: '[ˈmɔːnɪŋ]',    chinese: '早晨, 上午',             stage: 'primary', difficulty: 2 },
  { id: 'wd_afternoon', english: 'afternoon', phonetic: '[ˌɑːftəˈnuːn]', chinese: '下午',                  stage: 'primary', difficulty: 3 },
  { id: 'wd_evening',   english: 'evening',   phonetic: '[ˈiːvnɪŋ]',    chinese: '傍晚; 晚上',             stage: 'primary', difficulty: 3 },
  { id: 'wd_night',     english: 'night',     phonetic: '[naɪt]',       chinese: '夜, 夜晚',               stage: 'primary', difficulty: 1 },
  { id: 'wd_day',       english: 'day',       phonetic: '[deɪ]',        chinese: '白天, 一日',             stage: 'primary', difficulty: 1 },
  { id: 'wd_today',     english: 'today',     phonetic: '[təˈdeɪ]',     chinese: '今天',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_tomorrow',  english: 'tomorrow',  phonetic: '[təˈmɒrəʊ]',   chinese: '明天',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_yesterday', english: 'yesterday', phonetic: '[ˈjestədeɪ]',   chinese: '昨天',                   stage: 'primary', difficulty: 3 },

  // ============================================================
  // 3. 家庭成员
  // ============================================================
  { id: 'wd_family',    english: 'family',    phonetic: '[ˈfæməli]',    chinese: '家庭, 家人',             stage: 'primary', difficulty: 2 },
  { id: 'wd_father',    english: 'father',    phonetic: '[ˈfɑːðə(r)]',  chinese: '父亲, 爸爸',             stage: 'primary', difficulty: 2 },
  { id: 'wd_mother',    english: 'mother',    phonetic: '[ˈmʌðə(r)]',   chinese: '母亲, 妈妈',             stage: 'primary', difficulty: 2 },
  { id: 'wd_dad',       english: 'dad',       phonetic: '[dæd]',        chinese: '爸爸',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_mom',       english: 'mom',       phonetic: '[mɒm]',        chinese: '妈妈',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_parent',    english: 'parent',    phonetic: '[ˈpeərənt]',   chinese: '父亲或母亲, 家长',       stage: 'primary', difficulty: 3 },
  { id: 'wd_brother',   english: 'brother',   phonetic: '[ˈbrʌðə(r)]',  chinese: '兄, 弟',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_sister',    english: 'sister',    phonetic: '[ˈsɪstə(r)]',  chinese: '姐, 妹',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_grandma',   english: 'grandma',   phonetic: '[ˈɡrænmɑː]',   chinese: '奶奶, 外婆',             stage: 'primary', difficulty: 2, mnemonic: 'grand + ma = 大妈妈' },
  { id: 'wd_grandpa',   english: 'grandpa',   phonetic: '[ˈɡrænpɑː]',   chinese: '爷爷, 外公',             stage: 'primary', difficulty: 2 },
  { id: 'wd_baby',      english: 'baby',      phonetic: '[ˈbeɪbi]',     chinese: '婴儿',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_friend',    english: 'friend',    phonetic: '[frend]',      chinese: '朋友',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_boy',       english: 'boy',       phonetic: '[bɔɪ]',        chinese: '男孩',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_girl',      english: 'girl',      phonetic: '[ɡɜːl]',       chinese: '女孩',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_man',       english: 'man',       phonetic: '[mæn]',        chinese: '男人, 男子',             stage: 'primary', difficulty: 1 },
  { id: 'wd_woman',     english: 'woman',     phonetic: '[ˈwʊmən]',    chinese: '女人, 女子',             stage: 'primary', difficulty: 2 },
  { id: 'wd_people',    english: 'people',    phonetic: '[ˈpiːpl]',     chinese: '人们, 大家',             stage: 'primary', difficulty: 2 },
  { id: 'wd_kid',       english: 'kid',       phonetic: '[kɪd]',        chinese: '小孩, 孩子',             stage: 'primary', difficulty: 2 },
  { id: 'wd_person',    english: 'person',    phonetic: '[ˈpɜːsn]',     chinese: '人, 个体',               stage: 'primary', difficulty: 3 },

  // ============================================================
  // 4. 人称代词 + 物主代词
  // ============================================================
  { id: 'wd_i',         english: 'I',         phonetic: '[aɪ]',         chinese: '我',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_you',       english: 'you',       phonetic: '[juː]',        chinese: '你, 你们',               stage: 'primary', difficulty: 1 },
  { id: 'wd_he',        english: 'he',        phonetic: '[hiː]',        chinese: '他',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_she',       english: 'she',       phonetic: '[ʃiː]',        chinese: '她',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_we',        english: 'we',        phonetic: '[wiː]',        chinese: '我们',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_they',      english: 'they',      phonetic: '[ðeɪ]',        chinese: '他们, 她们, 它们',       stage: 'primary', difficulty: 1 },
  { id: 'wd_it',        english: 'it',        phonetic: '[ɪt]',         chinese: '它',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_me',        english: 'me',        phonetic: '[miː]',        chinese: '我(宾格)',               stage: 'primary', difficulty: 1 },
  { id: 'wd_my',        english: 'my',        phonetic: '[maɪ]',        chinese: '我的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_your',      english: 'your',      phonetic: '[jɔː(r)]',     chinese: '你的, 你们的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_his',       english: 'his',       phonetic: '[hɪz]',        chinese: '他的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_her',       english: 'her',       phonetic: '[hɜː(r)]',     chinese: '她的, 她的(宾格)',       stage: 'primary', difficulty: 2 },
  { id: 'wd_our',       english: 'our',       phonetic: '[ˈaʊə(r)]',    chinese: '我们的',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_their',     english: 'their',     phonetic: '[ðeə(r)]',     chinese: '他们的',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_its',       english: 'its',       phonetic: '[ɪts]',        chinese: '它的',                   stage: 'primary', difficulty: 2 },

  // ============================================================
  // 5. 颜色
  // ============================================================
  { id: 'wd_color',     english: 'color',     phonetic: '[ˈkʌlə(r)]',   chinese: '颜色',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_red',       english: 'red',       phonetic: '[red]',        chinese: '红色; 红色的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_blue',      english: 'blue',      phonetic: '[bluː]',       chinese: '蓝色; 蓝色的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_green',     english: 'green',     phonetic: '[ɡriːn]',      chinese: '绿色; 绿色的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_yellow',    english: 'yellow',    phonetic: '[ˈjeləʊ]',    chinese: '黄色; 黄色的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_black',     english: 'black',     phonetic: '[blæk]',       chinese: '黑色; 黑色的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_white',     english: 'white',     phonetic: '[waɪt]',       chinese: '白色; 白色的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_orange',    english: 'orange',    phonetic: '[ˈɒrɪndʒ]',    chinese: '橙色; 橙色的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_pink',      english: 'pink',      phonetic: '[pɪŋk]',       chinese: '粉色; 粉色的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_purple',    english: 'purple',    phonetic: '[ˈpɜːpl]',     chinese: '紫色; 紫色的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_brown',     english: 'brown',     phonetic: '[braʊn]',      chinese: '棕色; 棕色的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_grey',      english: 'grey',      phonetic: '[ɡreɪ]',       chinese: '灰色; 灰色的',           stage: 'primary', difficulty: 3 },

  // ============================================================
  // 6. 教室 + 学习用品
  // ============================================================
  { id: 'wd_school',    english: 'school',    phonetic: '[skuːl]',      chinese: '学校',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_class',     english: 'class',     phonetic: '[klɑːs]',      chinese: '班级; 课',               stage: 'primary', difficulty: 2 },
  { id: 'wd_classroom', english: 'classroom', phonetic: '[ˈklɑːsruːm]', chinese: '教室',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_teacher',   english: 'teacher',   phonetic: '[ˈtiːtʃə(r)]', chinese: '老师, 教师',             stage: 'primary', difficulty: 2 },
  { id: 'wd_student',   english: 'student',   phonetic: '[ˈstjuːdnt]',  chinese: '学生',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_pupil',     english: 'pupil',     phonetic: '[ˈpjuːpl]',    chinese: '小学生; 瞳孔',           stage: 'primary', difficulty: 3 },
  { id: 'wd_book',      english: 'book',      phonetic: '[bʊk]',        chinese: '书, 本子',               stage: 'primary', difficulty: 1 },
  { id: 'wd_pen',       english: 'pen',       phonetic: '[pen]',        chinese: '钢笔',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_pencil',    english: 'pencil',    phonetic: '[ˈpensl]',     chinese: '铅笔',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_ruler',     english: 'ruler',     phonetic: '[ˈruːlə(r)]',  chinese: '尺子',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_eraser',    english: 'eraser',    phonetic: '[ɪˈreɪzə(r)]', chinese: '橡皮',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_bag',       english: 'bag',       phonetic: '[bæɡ]',        chinese: '包; 书包',               stage: 'primary', difficulty: 1, mnemonic: '背(bèi)上 bag 去学校' },
  { id: 'wd_desk',      english: 'desk',      phonetic: '[desk]',       chinese: '书桌',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_chair',     english: 'chair',     phonetic: '[tʃeə(r)]',    chinese: '椅子',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_table',     english: 'table',     phonetic: '[ˈteɪbl]',     chinese: '桌子, 台子',             stage: 'primary', difficulty: 1 },
  { id: 'wd_door',      english: 'door',      phonetic: '[dɔː(r)]',     chinese: '门',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_window',    english: 'window',    phonetic: '[ˈwɪndəʊ]',    chinese: '窗户',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_board',     english: 'board',     phonetic: '[bɔːd]',       chinese: '木板; 黑板',             stage: 'primary', difficulty: 2 },
  { id: 'wd_paper',     english: 'paper',     phonetic: '[ˈpeɪpə(r)]',  chinese: '纸; 报纸',               stage: 'primary', difficulty: 2 },
  { id: 'wd_picture',   english: 'picture',   phonetic: '[ˈpɪktʃə(r)]', chinese: '图画, 照片',             stage: 'primary', difficulty: 2 },
  { id: 'wd_map',       english: 'map',       phonetic: '[mæp]',        chinese: '地图',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_dictionary',english: 'dictionary',phonetic: '[ˈdɪkʃənri]',  chinese: '词典',                   stage: 'primary', difficulty: 4 },

  // ============================================================
  // 7. 学科
  // ============================================================
  { id: 'wd_lesson',    english: 'lesson',    phonetic: '[ˈlesn]',      chinese: '课; 功课',               stage: 'primary', difficulty: 3 },
  { id: 'wd_math',      english: 'math',      phonetic: '[mæθ]',        chinese: '数学',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_Chinese',   english: 'Chinese',   phonetic: '[ˌtʃaɪˈniːz]', chinese: '中文, 语文',             stage: 'primary', difficulty: 2 },
  { id: 'wd_English',   english: 'English',   phonetic: '[ˈɪŋɡlɪʃ]',    chinese: '英语, 英文',             stage: 'primary', difficulty: 2 },
  { id: 'wd_music',     english: 'music',     phonetic: '[ˈmjuːzɪk]',   chinese: '音乐',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_art',       english: 'art',       phonetic: '[ɑːt]',        chinese: '艺术; 美术',             stage: 'primary', difficulty: 2 },
  { id: 'wd_science',   english: 'science',   phonetic: '[ˈsaɪəns]',    chinese: '科学',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_pe',        english: 'PE',        phonetic: '[ˌpiːˈiː]',    chinese: '体育',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_history',   english: 'history',   phonetic: '[ˈhɪstri]',    chinese: '历史',                   stage: 'primary', difficulty: 4 },

  // ============================================================
  // 8. 身体部位
  // ============================================================
  { id: 'wd_body',      english: 'body',      phonetic: '[ˈbɒdi]',      chinese: '身体',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_head',      english: 'head',      phonetic: '[hed]',        chinese: '头, 头部',               stage: 'primary', difficulty: 1 },
  { id: 'wd_face',      english: 'face',      phonetic: '[feɪs]',       chinese: '脸',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_eye',       english: 'eye',       phonetic: '[aɪ]',         chinese: '眼睛',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_ear',       english: 'ear',       phonetic: '[ɪə(r)]',      chinese: '耳朵',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_nose',      english: 'nose',      phonetic: '[nəʊz]',       chinese: '鼻子',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_mouth',     english: 'mouth',     phonetic: '[maʊθ]',       chinese: '嘴, 口',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_tooth',     english: 'tooth',     phonetic: '[tuːθ]',       chinese: '牙齿',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_hair',      english: 'hair',      phonetic: '[heə(r)]',     chinese: '头发; 毛发',             stage: 'primary', difficulty: 2 },
  { id: 'wd_hand',      english: 'hand',      phonetic: '[hænd]',       chinese: '手',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_arm',       english: 'arm',       phonetic: '[ɑːm]',        chinese: '手臂, 胳膊',             stage: 'primary', difficulty: 3 },
  { id: 'wd_leg',       english: 'leg',       phonetic: '[leɡ]',        chinese: '腿',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_foot',      english: 'foot',      phonetic: '[fʊt]',        chinese: '脚; 英尺',               stage: 'primary', difficulty: 2 },
  { id: 'wd_finger',    english: 'finger',    phonetic: '[ˈfɪŋɡə(r)]',  chinese: '手指',                   stage: 'primary', difficulty: 3 },

  // ============================================================
  // 9. 动物
  // ============================================================
  { id: 'wd_cat',       english: 'cat',       phonetic: '[kæt]',        chinese: '猫',                     stage: 'primary', difficulty: 1, mnemonic: '小猫 cat 喵喵喵' },
  { id: 'wd_dog',       english: 'dog',       phonetic: '[dɒɡ]',        chinese: '狗',                     stage: 'primary', difficulty: 1, mnemonic: '小狗 dog 看家汪汪叫' },
  { id: 'wd_fish',      english: 'fish',      phonetic: '[fɪʃ]',        chinese: '鱼; 鱼肉',               stage: 'primary', difficulty: 1 },
  { id: 'wd_bird',      english: 'bird',      phonetic: '[bɜːd]',       chinese: '鸟, 禽',                 stage: 'primary', difficulty: 1 },
  { id: 'wd_duck',      english: 'duck',      phonetic: '[dʌk]',        chinese: '鸭子',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_chicken',   english: 'chicken',   phonetic: '[ˈtʃɪkɪn]',    chinese: '鸡; 鸡肉',               stage: 'primary', difficulty: 2 },
  { id: 'wd_pig',       english: 'pig',       phonetic: '[pɪɡ]',        chinese: '猪',                     stage: 'primary', difficulty: 2, mnemonic: 'pig 是爱滚泥巴的猪' },
  { id: 'wd_cow',       english: 'cow',       phonetic: '[kaʊ]',        chinese: '母牛; 奶牛',             stage: 'primary', difficulty: 2 },
  { id: 'wd_horse',     english: 'horse',     phonetic: '[hɔːs]',       chinese: '马',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_sheep',     english: 'sheep',     phonetic: '[ʃiːp]',       chinese: '绵羊',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_rabbit',    english: 'rabbit',    phonetic: '[ˈræbɪt]',     chinese: '兔子',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_tiger',     english: 'tiger',     phonetic: '[ˈtaɪɡə(r)]',  chinese: '老虎',                   stage: 'primary', difficulty: 4, mnemonic: '泰山 tiger' },
  { id: 'wd_lion',      english: 'lion',      phonetic: '[ˈlaɪən]',     chinese: '狮子',                   stage: 'primary', difficulty: 4, mnemonic: 'L(躺)+ion → 狮子躺着' },
  { id: 'wd_elephant',  english: 'elephant',  phonetic: '[ˈelɪfənt]',   chinese: '大象',                   stage: 'primary', difficulty: 5 },
  { id: 'wd_monkey',    english: 'monkey',    phonetic: '[ˈmʌŋki]',     chinese: '猴子',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_panda',     english: 'panda',     phonetic: '[ˈpændə]',     chinese: '熊猫',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_bear',      english: 'bear',      phonetic: '[beə(r)]',     chinese: '熊',                     stage: 'primary', difficulty: 3 },
  { id: 'wd_fox',       english: 'fox',       phonetic: '[fɒks]',       chinese: '狐狸',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_animal',    english: 'animal',    phonetic: '[ˈænɪml]',     chinese: '动物; 牲畜',             stage: 'primary', difficulty: 2 },
  { id: 'wd_insect',    english: 'insect',    phonetic: '[ˈɪnsekt]',    chinese: '昆虫',                   stage: 'primary', difficulty: 5 },
  { id: 'wd_butterfly', english: 'butterfly', phonetic: '[ˈbʌtəflaɪ]',  chinese: '蝴蝶',                   stage: 'primary', difficulty: 5 },

  // ============================================================
  // 10. 食物 + 饮料
  // ============================================================
  { id: 'wd_food',      english: 'food',      phonetic: '[fuːd]',       chinese: '食物',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_water',     english: 'water',     phonetic: '[ˈwɔːtə(r)]',  chinese: '水',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_milk',      english: 'milk',      phonetic: '[mɪlk]',       chinese: '牛奶',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_juice',     english: 'juice',     phonetic: '[dʒuːs]',      chinese: '果汁, 饮料',             stage: 'primary', difficulty: 2 },
  { id: 'wd_tea',       english: 'tea',       phonetic: '[tiː]',        chinese: '茶',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_coffee',    english: 'coffee',    phonetic: '[ˈkɒfi]',      chinese: '咖啡',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_rice',      english: 'rice',      phonetic: '[raɪs]',       chinese: '米饭; 米',               stage: 'primary', difficulty: 1 },
  { id: 'wd_bread',     english: 'bread',     phonetic: '[bred]',       chinese: '面包',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_egg',       english: 'egg',       phonetic: '[eɡ]',         chinese: '蛋; 鸡蛋',               stage: 'primary', difficulty: 1 },
  { id: 'wd_meat',      english: 'meat',      phonetic: '[miːt]',       chinese: '肉',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_chicken2',  english: 'chicken',   phonetic: '[ˈtʃɪkɪn]',    chinese: '鸡肉',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_cake',      english: 'cake',      phonetic: '[keɪk]',       chinese: '蛋糕; 饼',               stage: 'primary', difficulty: 2 },
  { id: 'wd_candy',     english: 'candy',     phonetic: '[ˈkændi]',     chinese: '糖果',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_ice',       english: 'ice',       phonetic: '[aɪs]',        chinese: '冰',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_ice_cream', english: 'ice-cream', phonetic: '[ˈaɪs kriːm]', chinese: '冰淇淋',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_cake_fruit',english: 'apple',     phonetic: '[ˈæpl]',       chinese: '苹果',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_banana',    english: 'banana',    phonetic: '[bəˈnɑːnə]',   chinese: '香蕉',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_pear',      english: 'pear',      phonetic: '[peə(r)]',     chinese: '梨',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_grape',     english: 'grape',     phonetic: '[ɡreɪp]',      chinese: '葡萄',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_strawberry',english: 'strawberry',phonetic: '[ˈstrɔːbəri]', chinese: '草莓',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_peach',     english: 'peach',     phonetic: '[piːtʃ]',      chinese: '桃',                     stage: 'primary', difficulty: 3 },
  { id: 'wd_vegetable', english: 'vegetable', phonetic: '[ˈvedʒtəbl]',  chinese: '蔬菜',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_tomato',    english: 'tomato',    phonetic: '[təˈmɑːtəʊ]',  chinese: '番茄, 西红柿',           stage: 'primary', difficulty: 3 },
  { id: 'wd_potato',    english: 'potato',    phonetic: '[pəˈteɪtəʊ]',  chinese: '土豆, 马铃薯',           stage: 'primary', difficulty: 3 },
  { id: 'wd_carrot',    english: 'carrot',    phonetic: '[ˈkærət]',     chinese: '胡萝卜',                 stage: 'primary', difficulty: 4 },

  // ============================================================
  // 11. 衣物 + 鞋帽
  // ============================================================
  { id: 'wd_clothes',   english: 'clothes',   phonetic: '[kləʊðz]',     chinese: '衣服',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_shirt',     english: 'shirt',     phonetic: '[ʃɜːt]',       chinese: '衬衫, T恤',              stage: 'primary', difficulty: 2 },
  { id: 'wd_T_shirt',   english: 'T-shirt',   phonetic: '[ˈtiː ʃɜːt]',  chinese: 'T恤衫',                  stage: 'primary', difficulty: 3 },
  { id: 'wd_pants',     english: 'pants',     phonetic: '[pænts]',      chinese: '裤子',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_skirt',     english: 'skirt',     phonetic: '[skɜːt]',      chinese: '裙子',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_dress',     english: 'dress',     phonetic: '[dres]',       chinese: '连衣裙; 服装',           stage: 'primary', difficulty: 2 },
  { id: 'wd_coat',      english: 'coat',      phonetic: '[kəʊt]',       chinese: '外套, 大衣',             stage: 'primary', difficulty: 2 },
  { id: 'wd_jacket',    english: 'jacket',    phonetic: '[ˈdʒækɪt]',    chinese: '夹克',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_hat',       english: 'hat',       phonetic: '[hæt]',        chinese: '帽子',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_cap',       english: 'cap',       phonetic: '[kæp]',        chinese: '便帽, 鸭舌帽',           stage: 'primary', difficulty: 2 },
  { id: 'wd_shoe',      english: 'shoe',      phonetic: '[ʃuː]',        chinese: '鞋',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_sock',      english: 'sock',      phonetic: '[sɒk]',        chinese: '袜子',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_gloves',    english: 'gloves',    phonetic: '[ɡlʌvz]',      chinese: '手套',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_scarf',     english: 'scarf',     phonetic: '[skɑːf]',      chinese: '围巾; 头巾',             stage: 'primary', difficulty: 4 },

  // ============================================================
  // 12. 交通工具
  // ============================================================
  { id: 'wd_car',       english: 'car',       phonetic: '[kɑː(r)]',     chinese: '汽车; 小汽车',           stage: 'primary', difficulty: 1 },
  { id: 'wd_bus',       english: 'bus',       phonetic: '[bʌs]',        chinese: '公共汽车',               stage: 'primary', difficulty: 1 },
  { id: 'wd_bike',      english: 'bike',      phonetic: '[baɪk]',       chinese: '自行车',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_train',     english: 'train',     phonetic: '[treɪn]',      chinese: '火车',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_plane',     english: 'plane',     phonetic: '[pleɪn]',      chinese: '飞机',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_ship',      english: 'ship',      phonetic: '[ʃɪp]',        chinese: '船, 轮船',               stage: 'primary', difficulty: 2 },
  { id: 'wd_boat',      english: 'boat',      phonetic: '[bəʊt]',       chinese: '小船, 舟',               stage: 'primary', difficulty: 2 },
  { id: 'wd_taxi',      english: 'taxi',      phonetic: '[ˈtæksi]',     chinese: '出租车',                 stage: 'primary', difficulty: 3 },

  // ============================================================
  // 13. 地点 + 房间
  // ============================================================
  { id: 'wd_home',      english: 'home',      phonetic: '[həʊm]',       chinese: '家',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_room',      english: 'room',      phonetic: '[ruːm]',       chinese: '房间',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_bedroom',   english: 'bedroom',   phonetic: '[ˈbedruːm]',   chinese: '卧室',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_living_room',english:'living room',phonetic:'[ˈlɪvɪŋ ruːm]',chinese: '客厅',                    stage: 'primary', difficulty: 5 },
  { id: 'wd_bathroom',  english: 'bathroom',  phonetic: '[ˈbɑːθruːm]',  chinese: '浴室, 卫生间',           stage: 'primary', difficulty: 4 },
  { id: 'wd_kitchen',   english: 'kitchen',   phonetic: '[ˈkɪtʃɪn]',    chinese: '厨房',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_garden',    english: 'garden',    phonetic: '[ˈɡɑːdn]',     chinese: '花园, 果园',             stage: 'primary', difficulty: 3 },
  { id: 'wd_park',      english: 'park',      phonetic: '[pɑːk]',       chinese: '公园',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_zoo',       english: 'zoo',       phonetic: '[zuː]',        chinese: '动物园',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_shop',      english: 'shop',      phonetic: '[ʃɒp]',        chinese: '商店; 购物',             stage: 'primary', difficulty: 2 },
  { id: 'wd_store',     english: 'store',     phonetic: '[stɔː(r)]',    chinese: '商店',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_market',    english: 'market',    phonetic: '[ˈmɑːkɪt]',    chinese: '市场, 集市',             stage: 'primary', difficulty: 3 },
  { id: 'wd_hospital',  english: 'hospital',  phonetic: '[ˈhɒspɪtl]',   chinese: '医院',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_street',    english: 'street',    phonetic: '[striːt]',     chinese: '街道; 街',               stage: 'primary', difficulty: 3 },
  { id: 'wd_road',      english: 'road',      phonetic: '[rəʊd]',       chinese: '路, 道路',               stage: 'primary', difficulty: 2 },
  { id: 'wd_bridge',    english: 'bridge',    phonetic: '[brɪdʒ]',      chinese: '桥',                     stage: 'primary', difficulty: 3 },
  { id: 'wd_city',      english: 'city',      phonetic: '[ˈsɪti]',      chinese: '城市',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_country',   english: 'country',   phonetic: '[ˈkʌntri]',    chinese: '国家; 乡村',             stage: 'primary', difficulty: 3 },
  { id: 'wd_China',     english: 'China',     phonetic: '[ˈtʃaɪnə]',    chinese: '中国',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_world',     english: 'world',     phonetic: '[wɜːld]',      chinese: '世界',                   stage: 'primary', difficulty: 3 },

  // ============================================================
  // 14. 形状 + 数字单位
  // ============================================================
  { id: 'wd_line',      english: 'line',      phonetic: '[laɪn]',       chinese: '线; 排, 行',             stage: 'primary', difficulty: 3 },
  { id: 'wd_circle',    english: 'circle',    phonetic: '[ˈsɜːkl]',     chinese: '圆; 圆形',               stage: 'primary', difficulty: 4 },
  { id: 'wd_box',       english: 'box',       phonetic: '[bɒks]',       chinese: '盒子; 箱子',             stage: 'primary', difficulty: 1 },
  { id: 'wd_ball',      english: 'ball',      phonetic: '[bɔːl]',       chinese: '球',                     stage: 'primary', difficulty: 1 },

  // ============================================================
  // 15. 时间 + 日期
  // ============================================================
  { id: 'wd_time',      english: 'time',      phonetic: '[taɪm]',       chinese: '时间; 次',               stage: 'primary', difficulty: 1 },
  { id: 'wd_week',      english: 'week',      phonetic: '[wiːk]',       chinese: '星期; 周',               stage: 'primary', difficulty: 2 },
  { id: 'wd_weekend',   english: 'weekend',   phonetic: '[ˌwiːkˈend]',   chinese: '周末',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_month',     english: 'month',     phonetic: '[mʌnθ]',       chinese: '月; 月份',               stage: 'primary', difficulty: 3 },
  { id: 'wd_year',      english: 'year',      phonetic: '[jɪə(r)]',     chinese: '年; 岁',                 stage: 'primary', difficulty: 1 },
  { id: 'wd_hour',      english: 'hour',      phonetic: '[ˈaʊə(r)]',    chinese: '小时',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_minute',    english: 'minute',    phonetic: '[ˈmɪnɪt]',     chinese: '分钟',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_Monday',    english: 'Monday',    phonetic: '[ˈmʌndeɪ]',    chinese: '星期一',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_Tuesday',   english: 'Tuesday',   phonetic: '[ˈtjuːzdeɪ]',  chinese: '星期二',                 stage: 'primary', difficulty: 4 },
  { id: 'wd_Wednesday', english: 'Wednesday', phonetic: '[ˈwenzdeɪ]',   chinese: '星期三',                 stage: 'primary', difficulty: 5 },
  { id: 'wd_Thursday',  english: 'Thursday',  phonetic: '[ˈθɜːzdeɪ]',   chinese: '星期四',                 stage: 'primary', difficulty: 5 },
  { id: 'wd_Friday',    english: 'Friday',    phonetic: '[ˈfraɪdeɪ]',   chinese: '星期五',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_Saturday',  english: 'Saturday',  phonetic: '[ˈsætədeɪ]',   chinese: '星期六',                 stage: 'primary', difficulty: 4 },
  { id: 'wd_Sunday',    english: 'Sunday',    phonetic: '[ˈsʌndeɪ]',    chinese: '星期日',                 stage: 'primary', difficulty: 3 },

  // ============================================================
  // 16. 天气 + 自然
  // ============================================================
  { id: 'wd_weather',   english: 'weather',   phonetic: '[ˈweðə(r)]',   chinese: '天气',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_sun',       english: 'sun',       phonetic: '[sʌn]',        chinese: '太阳; 阳光',             stage: 'primary', difficulty: 1 },
  { id: 'wd_sunny',     english: 'sunny',     phonetic: '[ˈsʌni]',      chinese: '晴朗的',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_cloud',     english: 'cloud',     phonetic: '[klaʊd]',      chinese: '云',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_cloudy',    english: 'cloudy',    phonetic: '[ˈklaʊdi]',    chinese: '多云的',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_rain',      english: 'rain',      phonetic: '[reɪn]',       chinese: '雨; 下雨',               stage: 'primary', difficulty: 2 },
  { id: 'wd_snow',      english: 'snow',      phonetic: '[snəʊ]',       chinese: '雪; 下雪',               stage: 'primary', difficulty: 2 },
  { id: 'wd_wind',      english: 'wind',      phonetic: '[wɪnd]',       chinese: '风',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_windy',     english: 'windy',     phonetic: '[ˈwɪndi]',     chinese: '有风的',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_hot',       english: 'hot',       phonetic: '[hɒt]',        chinese: '热的; 辣的',             stage: 'primary', difficulty: 1 },
  { id: 'wd_cold',      english: 'cold',      phonetic: '[kəʊld]',      chinese: '冷的; 寒冷的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_warm',      english: 'warm',      phonetic: '[wɔːm]',       chinese: '温暖的; 暖和的',         stage: 'primary', difficulty: 2 },
  { id: 'wd_cool',      english: 'cool',      phonetic: '[kuːl]',       chinese: '凉的; 凉爽的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_sky',       english: 'sky',       phonetic: '[skaɪ]',       chinese: '天空',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_tree',      english: 'tree',      phonetic: '[triː]',       chinese: '树, 树木',               stage: 'primary', difficulty: 1 },
  { id: 'wd_flower',    english: 'flower',    phonetic: '[ˈflaʊə(r)]',  chinese: '花, 花卉',               stage: 'primary', difficulty: 2 },
  { id: 'wd_grass',     english: 'grass',     phonetic: '[ɡrɑːs]',      chinese: '草; 草地',               stage: 'primary', difficulty: 3 },
  { id: 'wd_river',     english: 'river',     phonetic: '[ˈrɪvə(r)]',   chinese: '河, 江',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_sea',       english: 'sea',       phonetic: '[siː]',        chinese: '海, 海洋',               stage: 'primary', difficulty: 2 },
  { id: 'wd_mountain',  english: 'mountain',  phonetic: '[ˈmaʊntɪn]',   chinese: '山, 山岳',               stage: 'primary', difficulty: 4 },
  { id: 'wd_lake',      english: 'lake',      phonetic: '[leɪk]',       chinese: '湖',                     stage: 'primary', difficulty: 4 },
  { id: 'wd_flower2',   english: 'rose',      phonetic: '[rəʊz]',       chinese: '玫瑰',                   stage: 'primary', difficulty: 4 },

  // ============================================================
  // 17. 常用动词
  // ============================================================
  { id: 'wd_go',        english: 'go',        phonetic: '[ɡəʊ]',        chinese: '去; 走',                 stage: 'primary', difficulty: 1 },
  { id: 'wd_come',      english: 'come',      phonetic: '[kʌm]',        chinese: '来; 到来',               stage: 'primary', difficulty: 1 },
  { id: 'wd_run',       english: 'run',       phonetic: '[rʌn]',        chinese: '跑, 奔跑',               stage: 'primary', difficulty: 1 },
  { id: 'wd_walk',      english: 'walk',      phonetic: '[wɔːk]',       chinese: '走, 步行',               stage: 'primary', difficulty: 1 },
  { id: 'wd_jump',      english: 'jump',      phonetic: '[dʒʌmp]',      chinese: '跳, 跳跃',               stage: 'primary', difficulty: 1 },
  { id: 'wd_sit',       english: 'sit',       phonetic: '[sɪt]',        chinese: '坐',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_stand',     english: 'stand',     phonetic: '[stænd]',      chinese: '站, 站立',               stage: 'primary', difficulty: 2 },
  { id: 'wd_sleep',     english: 'sleep',     phonetic: '[sliːp]',      chinese: '睡觉',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_wake',      english: 'wake',      phonetic: '[weɪk]',       chinese: '醒来; 唤醒',             stage: 'primary', difficulty: 2 },
  { id: 'wd_eat',       english: 'eat',       phonetic: '[iːt]',        chinese: '吃',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_drink',     english: 'drink',     phonetic: '[drɪŋk]',      chinese: '喝; 饮料',               stage: 'primary', difficulty: 1 },
  { id: 'wd_play',      english: 'play',      phonetic: '[pleɪ]',       chinese: '玩; 演奏; 打球',         stage: 'primary', difficulty: 1 },
  { id: 'wd_read',      english: 'read',      phonetic: '[riːd]',       chinese: '读, 阅读',               stage: 'primary', difficulty: 1 },
  { id: 'wd_write',     english: 'write',     phonetic: '[raɪt]',       chinese: '写',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_draw',      english: 'draw',      phonetic: '[drɔː]',       chinese: '画; 绘画',               stage: 'primary', difficulty: 2 },
  { id: 'wd_sing',      english: 'sing',      phonetic: '[sɪŋ]',        chinese: '唱, 唱歌',               stage: 'primary', difficulty: 1 },
  { id: 'wd_dance',     english: 'dance',     phonetic: '[dɑːns]',      chinese: '跳舞; 舞蹈',             stage: 'primary', difficulty: 2 },
  { id: 'wd_swim',      english: 'swim',      phonetic: '[swɪm]',       chinese: '游泳',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_look',      english: 'look',      phonetic: '[lʊk]',        chinese: '看; 看起来',             stage: 'primary', difficulty: 1 },
  { id: 'wd_see',       english: 'see',       phonetic: '[siː]',        chinese: '看见; 理解',             stage: 'primary', difficulty: 1 },
  { id: 'wd_watch',     english: 'watch',     phonetic: '[wɒtʃ]',       chinese: '看, 观看; 手表',         stage: 'primary', difficulty: 2 },
  { id: 'wd_listen',    english: 'listen',    phonetic: '[ˈlɪsn]',      chinese: '听, 倾听',               stage: 'primary', difficulty: 2 },
  { id: 'wd_hear',      english: 'hear',      phonetic: '[hɪə(r)]',     chinese: '听见',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_say',       english: 'say',       phonetic: '[seɪ]',        chinese: '说',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_talk',      english: 'talk',      phonetic: '[tɔːk]',       chinese: '说, 谈话',               stage: 'primary', difficulty: 1 },
  { id: 'wd_open',      english: 'open',      phonetic: '[ˈəʊpən]',     chinese: '打开; 开',               stage: 'primary', difficulty: 2 },
  { id: 'wd_close',     english: 'close',     phonetic: '[kləʊz]',      chinese: '关, 关闭',               stage: 'primary', difficulty: 2 },
  { id: 'wd_have',      english: 'have',      phonetic: '[hæv]',        chinese: '有; 吃; 喝',             stage: 'primary', difficulty: 1 },
  { id: 'wd_do',        english: 'do',        phonetic: '[duː]',        chinese: '做',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_make',      english: 'make',      phonetic: '[meɪk]',       chinese: '做, 制作',               stage: 'primary', difficulty: 1 },
  { id: 'wd_give',      english: 'give',      phonetic: '[ɡɪv]',        chinese: '给',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_take',      english: 'take',      phonetic: '[teɪk]',       chinese: '拿, 取; 乘坐',           stage: 'primary', difficulty: 1 },
  { id: 'wd_come_2',    english: 'bring',     phonetic: '[brɪŋ]',       chinese: '带来, 拿来',             stage: 'primary', difficulty: 2 },
  { id: 'wd_help',      english: 'help',      phonetic: '[help]',       chinese: '帮助',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_like',      english: 'like',      phonetic: '[laɪk]',       chinese: '喜欢',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_want',      english: 'want',      phonetic: '[wɒnt]',       chinese: '想要',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_need',      english: 'need',      phonetic: '[niːd]',       chinese: '需要',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_know',      english: 'know',      phonetic: '[nəʊ]',        chinese: '知道; 认识',             stage: 'primary', difficulty: 1 },
  { id: 'wd_think',     english: 'think',     phonetic: '[θɪŋk]',       chinese: '想; 认为',               stage: 'primary', difficulty: 2 },
  { id: 'wd_love',      english: 'love',      phonetic: '[lʌv]',        chinese: '爱; 喜爱',               stage: 'primary', difficulty: 1 },
  { id: 'wd_work',      english: 'work',      phonetic: '[wɜːk]',       chinese: '工作',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_study',     english: 'study',     phonetic: '[ˈstʌdi]',     chinese: '学习; 研究',             stage: 'primary', difficulty: 2 },
  { id: 'wd_learn',     english: 'learn',     phonetic: '[lɜːn]',       chinese: '学习, 学到',             stage: 'primary', difficulty: 2 },
  { id: 'wd_teach',     english: 'teach',     phonetic: '[tiːtʃ]',      chinese: '教, 教学',               stage: 'primary', difficulty: 2 },
  { id: 'wd_tell',      english: 'tell',      phonetic: '[tel]',        chinese: '告诉, 讲述',             stage: 'primary', difficulty: 2 },
  { id: 'wd_ask',       english: 'ask',       phonetic: '[ɑːsk]',       chinese: '问, 询问',               stage: 'primary', difficulty: 1 },
  { id: 'wd_answer',    english: 'answer',    phonetic: '[ˈɑːnsə(r)]',  chinese: '回答; 答复',             stage: 'primary', difficulty: 2 },
  { id: 'wd_find',      english: 'find',      phonetic: '[faɪnd]',      chinese: '找到, 发现',             stage: 'primary', difficulty: 1 },
  { id: 'wd_put',       english: 'put',       phonetic: '[pʊt]',        chinese: '放, 放置',               stage: 'primary', difficulty: 1 },
  { id: 'wd_get',       english: 'get',       phonetic: '[ɡet]',        chinese: '得到; 到达',             stage: 'primary', difficulty: 1 },
  { id: 'wd_let',       english: 'let',       phonetic: '[let]',        chinese: '让',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_use',       english: 'use',       phonetic: '[juːz]',       chinese: '使用',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_show',      english: 'show',      phonetic: '[ʃəʊ]',       chinese: '展示, 给...看',          stage: 'primary', difficulty: 2 },
  { id: 'wd_clean',     english: 'clean',     phonetic: '[kliːn]',      chinese: '打扫; 干净的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_wash',      english: 'wash',      phonetic: '[wɒʃ]',        chinese: '洗, 洗涤',               stage: 'primary', difficulty: 2 },
  { id: 'wd_cook',      english: 'cook',      phonetic: '[kʊk]',        chinese: '做饭; 厨师',             stage: 'primary', difficulty: 2 },
  { id: 'wd_buy',       english: 'buy',       phonetic: '[baɪ]',        chinese: '买, 购买',               stage: 'primary', difficulty: 1 },
  { id: 'wd_sell',      english: 'sell',      phonetic: '[sel]',        chinese: '卖, 出售',               stage: 'primary', difficulty: 2 },
  { id: 'wd_meet',      english: 'meet',      phonetic: '[miːt]',       chinese: '遇见, 见面',             stage: 'primary', difficulty: 2 },
  { id: 'wd_visit',     english: 'visit',     phonetic: '[ˈvɪzɪt]',     chinese: '拜访, 参观',             stage: 'primary', difficulty: 3 },
  { id: 'wd_phone',     english: 'phone',     phonetic: '[fəʊn]',       chinese: '电话; 打电话',           stage: 'primary', difficulty: 2 },
  { id: 'wd_call',      english: 'call',      phonetic: '[kɔːl]',       chinese: '喊; 打电话',             stage: 'primary', difficulty: 2 },
  { id: 'wd_drive',     english: 'drive',     phonetic: '[draɪv]',      chinese: '驾驶, 开车',             stage: 'primary', difficulty: 3 },
  { id: 'wd_fly',       english: 'fly',       phonetic: '[flaɪ]',        chinese: '飞, 飞行',               stage: 'primary', difficulty: 2 },
  { id: 'wd_send',      english: 'send',      phonetic: '[send]',       chinese: '寄, 发送',               stage: 'primary', difficulty: 2 },
  { id: 'wd_forget',    english: 'forget',    phonetic: '[fəˈɡet]',     chinese: '忘记',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_try',       english: 'try',       phonetic: '[traɪ]',       chinese: '试, 尝试',               stage: 'primary', difficulty: 1 },

  // ============================================================
  // 18. 形容词
  // ============================================================
  { id: 'wd_big',       english: 'big',       phonetic: '[bɪɡ]',        chinese: '大的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_small',     english: 'small',     phonetic: '[smɔːl]',      chinese: '小的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_long',      english: 'long',      phonetic: '[lɒŋ]',        chinese: '长的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_short',     english: 'short',     phonetic: '[ʃɔːt]',       chinese: '短的; 矮的',             stage: 'primary', difficulty: 1 },
  { id: 'wd_tall',      english: 'tall',      phonetic: '[tɔːl]',       chinese: '高的, 高的(身材)',       stage: 'primary', difficulty: 2 },
  { id: 'wd_high',      english: 'high',      phonetic: '[haɪ]',        chinese: '高的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_low',       english: 'low',       phonetic: '[ləʊ]',        chinese: '低的',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_fast',      english: 'fast',      phonetic: '[fɑːst]',      chinese: '快的, 迅速的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_slow',      english: 'slow',      phonetic: '[sləʊ]',       chinese: '慢的',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_new',       english: 'new',       phonetic: '[njuː]',       chinese: '新的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_old',       english: 'old',       phonetic: '[əʊld]',       chinese: '旧的; 年老的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_good',      english: 'good',      phonetic: '[ɡʊd]',        chinese: '好的',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_bad',       english: 'bad',       phonetic: '[bæd]',        chinese: '坏的; 不好的',           stage: 'primary', difficulty: 1 },
  { id: 'wd_happy',     english: 'happy',     phonetic: '[ˈhæpi]',      chinese: '快乐的; 高兴的',         stage: 'primary', difficulty: 1 },
  { id: 'wd_sad',       english: 'sad',       phonetic: '[sæd]',        chinese: '悲伤的; 难过的',         stage: 'primary', difficulty: 1 },
  { id: 'wd_funny',     english: 'funny',     phonetic: '[ˈfʌni]',      chinese: '有趣的; 可笑的',         stage: 'primary', difficulty: 2 },
  { id: 'wd_pretty',    english: 'pretty',    phonetic: '[ˈprɪti]',     chinese: '漂亮的; 美丽的',         stage: 'primary', difficulty: 2 },
  { id: 'wd_beautiful', english: 'beautiful', phonetic: '[ˈbjuːtɪfl]',  chinese: '美丽的',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_nice',      english: 'nice',      phonetic: '[naɪs]',       chinese: '好的, 令人愉快的',       stage: 'primary', difficulty: 1 },
  { id: 'wd_easy',      english: 'easy',      phonetic: '[ˈiːzi]',      chinese: '容易的',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_hard',      english: 'hard',      phonetic: '[hɑːd]',       chinese: '困难的; 硬的',           stage: 'primary', difficulty: 3 },
  { id: 'wd_young',     english: 'young',     phonetic: '[jʌŋ]',        chinese: '年轻的',                 stage: 'primary', difficulty: 2 },
  { id: 'wd_kind',      english: 'kind',      phonetic: '[kaɪnd]',      chinese: '善良的; 亲切的',         stage: 'primary', difficulty: 3 },
  { id: 'wd_clever',    english: 'clever',    phonetic: '[ˈklevə(r)]',  chinese: '聪明的',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_busy',      english: 'busy',      phonetic: '[ˈbɪzi]',      chinese: '忙的',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_ready',     english: 'ready',     phonetic: '[ˈredi]',      chinese: '准备好的',               stage: 'primary', difficulty: 2 },
  { id: 'wd_right',     english: 'right',     phonetic: '[raɪt]',       chinese: '正确的; 右边',           stage: 'primary', difficulty: 2 },
  { id: 'wd_wrong',     english: 'wrong',     phonetic: '[rɒŋ]',        chinese: '错误的',                 stage: 'primary', difficulty: 1 },
  { id: 'wd_left',      english: 'left',      phonetic: '[left]',       chinese: '左边; 离开',             stage: 'primary', difficulty: 2 },
  { id: 'wd_full',      english: 'full',      phonetic: '[fʊl]',        chinese: '满的; 吃饱的',           stage: 'primary', difficulty: 2 },
  { id: 'wd_empty',     english: 'empty',     phonetic: '[ˈempti]',     chinese: '空的',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_open2',     english: 'open',      phonetic: '[ˈəʊpən]',     chinese: '开着的; 开放的',         stage: 'primary', difficulty: 2 },
  { id: 'wd_loud',      english: 'loud',      phonetic: '[laʊd]',       chinese: '大声的; 响亮的',         stage: 'primary', difficulty: 2 },

  // ============================================================
  // 19. 数字相关
  // ============================================================
  { id: 'wd_many',      english: 'many',      phonetic: '[ˈmeni]',      chinese: '许多, 多的',             stage: 'primary', difficulty: 1 },
  { id: 'wd_much',      english: 'much',      phonetic: '[mʌtʃ]',       chinese: '许多, 大量',             stage: 'primary', difficulty: 1 },
  { id: 'wd_some',      english: 'some',      phonetic: '[sʌm]',        chinese: '一些, 某些',             stage: 'primary', difficulty: 1 },
  { id: 'wd_any',       english: 'any',       phonetic: '[ˈeni]',       chinese: '任何; 一些',             stage: 'primary', difficulty: 2 },
  { id: 'wd_little',    english: 'little',    phonetic: '[ˈlɪtl]',      chinese: '小的; 少的',             stage: 'primary', difficulty: 2 },
  { id: 'wd_a_lot',     english: 'a lot',     phonetic: '[ə lɒt]',      chinese: '许多, 大量',             stage: 'primary', difficulty: 2 },
  { id: 'wd_money',     english: 'money',     phonetic: '[ˈmʌni]',      chinese: '钱, 金钱',               stage: 'primary', difficulty: 2 },
  { id: 'wd_yuan',      english: 'yuan',      phonetic: '[juˈɑːn]',     chinese: '元(人民币)',            stage: 'primary', difficulty: 4 },

  // ============================================================
  // 20. 兴趣 + 运动 + 娱乐
  // ============================================================
  { id: 'wd_song',      english: 'song',      phonetic: '[sɒŋ]',        chinese: '歌, 歌曲',               stage: 'primary', difficulty: 1 },
  { id: 'wd_movie',     english: 'movie',     phonetic: '[ˈmuːvi]',     chinese: '电影',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_game',      english: 'game',      phonetic: '[ɡeɪm]',       chinese: '游戏; 比赛',             stage: 'primary', difficulty: 2 },
  { id: 'wd_toy',       english: 'toy',       phonetic: '[tɔɪ]',        chinese: '玩具',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_ball_game', english: 'football',  phonetic: '[ˈfʊtbɔːl]',   chinese: '足球; 橄榄球',           stage: 'primary', difficulty: 3 },
  { id: 'wd_basketball',english: 'basketball',phonetic: '[ˈbɑːskɪtbɔːl]',chinese: '篮球',                  stage: 'primary', difficulty: 4 },
  { id: 'wd_ping_pong', english: 'ping-pong', phonetic: '[ˈpɪŋ pɒŋ]',   chinese: '乒乓球',                 stage: 'primary', difficulty: 4 },
  { id: 'wd_TV',        english: 'TV',        phonetic: '[ˌtiːˈviː]',    chinese: '电视',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_radio',     english: 'radio',     phonetic: '[ˈreɪdɪəʊ]',   chinese: '收音机; 电台',           stage: 'primary', difficulty: 3 },
  { id: 'wd_computer',  english: 'computer',  phonetic: '[kəmˈpjuːtə(r)]',chinese: '计算机, 电脑',         stage: 'primary', difficulty: 3 },
  { id: 'wd_phone2',    english: 'mobile',    phonetic: '[ˈməʊbaɪl]',   chinese: '手机',                   stage: 'primary', difficulty: 3 },

  // ============================================================
  // 21. 物品 + 工具
  // ============================================================
  { id: 'wd_book2',     english: 'storybook', phonetic: '[ˈstɔːribʊk]', chinese: '故事书',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_letter',    english: 'letter',    phonetic: '[ˈletə(r)]',   chinese: '字母; 信',               stage: 'primary', difficulty: 2 },
  { id: 'wd_word',      english: 'word',      phonetic: '[wɜːd]',       chinese: '单词; 字',               stage: 'primary', difficulty: 1 },
  { id: 'wd_name',      english: 'name',      phonetic: '[neɪm]',       chinese: '名字; 名称',             stage: 'primary', difficulty: 1 },
  { id: 'wd_number',    english: 'number',    phonetic: '[ˈnʌmbə(r)]',  chinese: '数字; 号码',             stage: 'primary', difficulty: 1 },
  { id: 'wd_question',  english: 'question',  phonetic: '[ˈkwestʃən]',  chinese: '问题',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_key',       english: 'key',       phonetic: '[kiː]',        chinese: '钥匙; 关键',             stage: 'primary', difficulty: 2 },
  { id: 'wd_clock',     english: 'clock',     phonetic: '[klɒk]',       chinese: '钟; 时钟',               stage: 'primary', difficulty: 1 },
  { id: 'wd_bed',       english: 'bed',       phonetic: '[bed]',        chinese: '床',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_lamp',      english: 'lamp',      phonetic: '[læmp]',       chinese: '灯',                     stage: 'primary', difficulty: 2 },
  { id: 'wd_mirror',    english: 'mirror',    phonetic: '[ˈmɪrə(r)]',   chinese: '镜子',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_radio2',    english: 'phone',     phonetic: '[fəʊn]',       chinese: '电话',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_camera',    english: 'camera',    phonetic: '[ˈkæmərə]',    chinese: '照相机; 摄影机',         stage: 'primary', difficulty: 3 },

  // ============================================================
  // 22. 节日 + 时间概念
  // ============================================================
  { id: 'wd_birthday',  english: 'birthday',  phonetic: '[ˈbɜːθdeɪ]',   chinese: '生日',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_present',   english: 'present',   phonetic: '[ˈpreznt]',    chinese: '礼物; 现在的',           stage: 'primary', difficulty: 3 },
  { id: 'wd_party',     english: 'party',     phonetic: '[ˈpɑːti]',     chinese: '派对; 聚会',             stage: 'primary', difficulty: 3 },
  { id: 'wd_Christmas', english: 'Christmas', phonetic: '[ˈkrɪsməs]',   chinese: '圣诞节',                 stage: 'primary', difficulty: 4 },
  { id: 'wd_Spring_Festival',english:'Spring Festival',phonetic:'[sprɪŋ ˈfɛstɪvəl]',chinese:'春节',stage:'primary',difficulty:5 },
];
