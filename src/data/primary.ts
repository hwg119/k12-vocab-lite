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
  { id: 'wd_a',         english: 'a',         phonetic: '[ə]',          chinese: '一(个); 一个的',         stage: 'primary', difficulty: 1 , exampleSentence: "Would you like a sandwich? 来块三明治好吗？" },
  { id: 'wd_an',        english: 'an',        phonetic: '[ən]',         chinese: '一(个); 用于元音前',     stage: 'primary', difficulty: 1 },
  { id: 'wd_the',       english: 'the',       phonetic: '[ðə]',         chinese: '这个, 那(些)',           stage: 'primary', difficulty: 1 , exampleSentence: "He described the scene to me. 他向我描述了那个情景。" },
  { id: 'wd_one',       english: 'one',       phonetic: '[wʌn]',        chinese: '一',                     stage: 'primary', difficulty: 1 , exampleSentence: "‘Have you got a camera?’ ‘No.’ ‘You should buy one’ (= buy a camera ). “你有照相机吗？”“没有。”“你应该买一架。”" , mnemonic: "同根：only / oneness" },
  { id: 'wd_two',       english: 'two',       phonetic: '[tuː]',        chinese: '二',                     stage: 'primary', difficulty: 1 , exampleSentence: "I’d like you to line up in twos, please. 请你们两个一组排好队。" , mnemonic: "同根：twosome / twoness" },
  { id: 'wd_three',     english: 'three',     phonetic: '[θriː]',       chinese: '三',                     stage: 'primary', difficulty: 1 , exampleSentence: "They’ve won their last three games. 他们赢了最近三场比赛。" , mnemonic: "同根：threesome" },
  { id: 'wd_four',      english: 'four',      phonetic: '[fɔː(r)]',     chinese: '四',                     stage: 'primary', difficulty: 1 , exampleSentence: "She is married with four children. 她已婚，有四个孩子。" , mnemonic: "同根：fourth / foursome" },
  { id: 'wd_five',      english: 'five',      phonetic: '[faɪv]',       chinese: '五',                     stage: 'primary', difficulty: 1 , exampleSentence: "There is also a golf course five miles away. 五英里外还有个高尔夫球场。" , mnemonic: "同根：fiver / fivesome" },
  { id: 'wd_six',       english: 'six',       phonetic: '[sɪks]',       chinese: '六',                     stage: 'primary', difficulty: 1 , exampleSentence: "six months ago 六个月前" , mnemonic: "同根：sixth / sixteen" },
  { id: 'wd_seven',     english: 'seven',     phonetic: '[ˈsevn]',      chinese: '七',                     stage: 'primary', difficulty: 2, mnemonic: '单词含七个字母' , exampleSentence: "The women visited cities in seven states. 这些女性访问了七个州的城市。" },
  { id: 'wd_eight',     english: 'eight',     phonetic: '[eɪt]',        chinese: '八',                     stage: 'primary', difficulty: 2 , exampleSentence: "It’s only eight days till Christmas. 还有8天就到圣诞节了。" , mnemonic: "同根：eighteen / eighty" },
  { id: 'wd_nine',      english: 'nine',      phonetic: '[naɪn]',       chinese: '九',                     stage: 'primary', difficulty: 2 , exampleSentence: "He’s only been in this job for nine months. 他干这份工作才九个月。" },
  { id: 'wd_ten',       english: 'ten',       phonetic: '[ten]',        chinese: '十',                     stage: 'primary', difficulty: 1 , exampleSentence: "Snow had been falling steadily for ten days. 雪已经连续下了10天了。" , mnemonic: "同根：tenner" },
  { id: 'wd_eleven',    english: 'eleven',    phonetic: '[ɪˈlevn]',     chinese: '十一',                   stage: 'primary', difficulty: 3 , exampleSentence: "She was sent to jail for eleven months. 她被判入狱11个月。" , mnemonic: "同根：eleventh" },
  { id: 'wd_twelve',    english: 'twelve',    phonetic: '[twelv]',      chinese: '十二',                   stage: 'primary', difficulty: 3 , exampleSentence: "He received a twelve-month jail sentence. 他获刑12个月。" , mnemonic: "同根：twelfth" },
  { id: 'wd_thirteen',  english: 'thirteen',  phonetic: '[ˌθɜːˈtiːn]',  chinese: '十三',                   stage: 'primary', difficulty: 4 , exampleSentence: "They’ve only sold thirteen tickets so far. 到目前为止他们仅仅售出13张票。" , mnemonic: "同根：thirteenth" },
  { id: 'wd_fifteen',   english: 'fifteen',   phonetic: '[ˌfɪfˈtiːn]',  chinese: '十五',                   stage: 'primary', difficulty: 4 , exampleSentence: "a coastal village fifteen miles south of Tourane 土伦以南15英里的一个滨海村落" , mnemonic: "同根：fifteenth" },
  { id: 'wd_twenty',    english: 'twenty',    phonetic: '[ˈtwenti]',    chinese: '二十',                   stage: 'primary', difficulty: 4 , exampleSentence: "a small village twenty miles from Nairobi 距内罗毕20英里的一个小村庄" , mnemonic: "同根：twentieth / twenties" },
  { id: 'wd_thirty',    english: 'thirty',    phonetic: '[ˈθɜːti]',    chinese: '三十',                   stage: 'primary', difficulty: 4 , exampleSentence: "In the thirties, air travel really began to take off. 在30年代，乘飞机旅行迅速流行了起来。" , mnemonic: "同根：thirtieth" },
  { id: 'wd_fifty',     english: 'fifty',     phonetic: '[ˈfɪfti]',     chinese: '五十',                   stage: 'primary', difficulty: 4 , exampleSentence: "Standards of living rose in the fifties. 50年代生活水平提高了。" , mnemonic: "同根：fiftieth" },
  { id: 'wd_hundred',   english: 'hundred',   phonetic: '[ˈhʌndrəd]',   chinese: '百',                     stage: 'primary', difficulty: 5 , exampleSentence: "Plank down your one hundred dollars. 立即支付一百美元。" , mnemonic: "同根：hundredth" },
  { id: 'wd_first',     english: 'first',     phonetic: '[fɜːst]',      chinese: '第一',                   stage: 'primary', difficulty: 2 , exampleSentence: "I’ll join you in a minute but I need to make a phone call first. 我一会儿就来，但是我得先打个电话。" , mnemonic: "同根：firstly" },
  { id: 'wd_second',    english: 'second',    phonetic: '[ˈsekənd]',    chinese: '第二; 秒',               stage: 'primary', difficulty: 3 , exampleSentence: "Hold your breath for six seconds. 请你屏气6秒钟。" , mnemonic: "同根：secondary / secondly" },
  { id: 'wd_third',     english: 'third',     phonetic: '[θɜːd]',       chinese: '第三',                   stage: 'primary', difficulty: 3 , exampleSentence: "Divide it into thirds. 把它分成三等份。" , mnemonic: "同根：thirteenth / thirtieth" },

  // ============================================================
  // 2. 问候 + 礼貌
  // ============================================================
  { id: 'wd_and',       english: 'and',       phonetic: '[ænd]',        chinese: '和, 与',                 stage: 'primary', difficulty: 1 , exampleSentence: "He’s gone to get some fish and chips. 他去买炸鱼薯条了。" },
  { id: 'wd_but',        english: 'but',       phonetic: '[bʌt]',        chinese: '但是',                   stage: 'primary', difficulty: 1 , exampleSentence: "It’s an old car, but it’s very reliable. 这是一辆旧车，但是性能非常可靠。" },
  { id: 'wd_or',         english: 'or',        phonetic: '[ɔː(r)]',      chinese: '或者',                   stage: 'primary', difficulty: 1 , exampleSentence: "Shall we go out to the cinema or stay at home? 我们是出去看电影还是待在家里？" },
  { id: 'wd_hello',     english: 'hello',     phonetic: '[həˈləʊ]',     chinese: '喂, 你好',               stage: 'primary', difficulty: 1 , exampleSentence: "Hello, John! How are you? 喂，约翰！你好吗？" },
  { id: 'wd_hi',         english: 'hi',        phonetic: '[haɪ]',        chinese: '嗨, 你好',               stage: 'primary', difficulty: 1 , exampleSentence: "Hi! How are you? 嗨！你好吗？" },
  { id: 'wd_goodbye',   english: 'goodbye',   phonetic: '[ɡʊdˈbaɪ]',    chinese: '再见',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_bye',       english: 'bye',       phonetic: '[baɪ]',        chinese: '再见',                   stage: 'primary', difficulty: 1 , exampleSentence: "Bye, Dave. 再见，戴夫。" },
  { id: 'wd_thank',     english: 'thank',     phonetic: '[θæŋk]',       chinese: '感谢; 谢谢',             stage: 'primary', difficulty: 1 , exampleSentence: "I haven’t had a chance to thank him yet. 我还没有机会向他表示谢意。" , mnemonic: "同根：thankful / thankless" },
  { id: 'wd_thanks',    english: 'thanks',    phonetic: '[θæŋks]',      chinese: '谢谢',                   stage: 'primary', difficulty: 1 },
  { id: 'wd_sorry',     english: 'sorry',     phonetic: '[ˈsɒri]',      chinese: '对不起, 抱歉',           stage: 'primary', difficulty: 1 , exampleSentence: "She was very sorry about all the trouble she'd caused. 她对自己造成的麻烦感到很内疚。" , mnemonic: "同根：sorrow / sorriness" },
  { id: 'wd_please',    english: 'please',    phonetic: '[pliːz]',      chinese: '请',                     stage: 'primary', difficulty: 1 , exampleSentence: "a business that wants to please its customers 希望让顾客满意的一家公司" , mnemonic: "同根：pleasant / pleased" },
  { id: 'wd_excuse',    english: 'excuse',    phonetic: '[ɪkˈskjuːz]',  chinese: '原谅, 打扰一下',         stage: 'primary', difficulty: 3 , exampleSentence: "I’m tired of listening to his excuses. 我听厌了他的种种理由。" , mnemonic: "同根：excusable / excusatory" },
  { id: 'wd_yes',       english: 'yes',       phonetic: '[jes]',        chinese: '是, 是的',               stage: 'primary', difficulty: 1 , exampleSentence: "‘Would you like a sandwich?’ ‘Yes, please.’ “你想来个三明治吗？”“好的，谢谢。”" },
  { id: 'wd_no',        english: 'no',        phonetic: '[nəʊ]',        chinese: '不, 不是',               stage: 'primary', difficulty: 1 , exampleSentence: "‘Are you Italian?’ ‘No, I’m Spanish.’ “你是意大利人吗？”“不，我是西班牙人。”" , mnemonic: "同根：nowise" },
  { id: 'wd_ok',        english: 'OK',        phonetic: '[ˌəʊˈkeɪ]',    chinese: '好, 可以',               stage: 'primary', difficulty: 1 , exampleSentence: "‘How was the film?’ ‘It was okay, but not brilliant.’ “电影怎么样？”“还算可以，但谈不上很好。”" },
  { id: 'wd_morning',   english: 'morning',   phonetic: '[ˈmɔːnɪŋ]',    chinese: '早晨, 上午',             stage: 'primary', difficulty: 2 , exampleSentence: "I hated those cold winter mornings. 我讨厌冬天里寒冷的早晨。" , mnemonic: "同根：morn" },
  { id: 'wd_afternoon', english: 'afternoon', phonetic: '[ˌɑːftəˈnuːn]', chinese: '下午',                  stage: 'primary', difficulty: 3 , exampleSentence: "There’s a meeting on Thursday afternoon . 星期四下午有个会议。" },
  { id: 'wd_evening',   english: 'evening',   phonetic: '[ˈiːvnɪŋ]',    chinese: '傍晚; 晚上',             stage: 'primary', difficulty: 3 , exampleSentence: "I do most of my studying in the evening. 我学习大都在晚上。" , mnemonic: "同根：even / eve" },
  { id: 'wd_night',     english: 'night',     phonetic: '[naɪt]',       chinese: '夜, 夜晚',               stage: 'primary', difficulty: 1 , exampleSentence: "It was a cold moonlit night. 那是个寒冷的月夜。" , mnemonic: "同根：nightly / nighted" },
  { id: 'wd_day',       english: 'day',       phonetic: '[deɪ]',        chinese: '白天, 一日',             stage: 'primary', difficulty: 1 , exampleSentence: "We spent three days in Paris. 我们在巴黎度过了三天。" , mnemonic: "同根：daily / daylight" },
  { id: 'wd_today',     english: 'today',     phonetic: '[təˈdeɪ]',     chinese: '今天',                   stage: 'primary', difficulty: 2 , exampleSentence: "I couldn’t go shopping yesterday so I’ll have to go today. 我昨天没能去买东西，所以今天我必须去。" },
  { id: 'wd_tomorrow',  english: 'tomorrow',  phonetic: '[təˈmɒrəʊ]',   chinese: '明天',                   stage: 'primary', difficulty: 2 , exampleSentence: "I’ll see you at tomorrow’s meeting. 明天会上见。" , mnemonic: "同根：tomorrower" },
  { id: 'wd_yesterday', english: 'yesterday', phonetic: '[ˈjestədeɪ]',   chinese: '昨天',                   stage: 'primary', difficulty: 3 , exampleSentence: "yesterday’s meeting 昨天的会议" , mnemonic: "同根：yesterdayness" },

  // ============================================================
  // 3. 家庭成员
  // ============================================================
  { id: 'wd_family',    english: 'family',    phonetic: '[ˈfæməli]',    chinese: '家庭, 家人',             stage: 'primary', difficulty: 2 , exampleSentence: "Do you know the family next door? 你认识隔壁那家人吗？" , mnemonic: "同根：familial" },
  { id: 'wd_father',    english: 'father',    phonetic: '[ˈfɑːðə(r)]',  chinese: '父亲, 爸爸',             stage: 'primary', difficulty: 2 , exampleSentence: "Ask your father to help you. 叫你父亲帮你。" , mnemonic: "同根：fatherless / fatherhood" },
  { id: 'wd_mother',    english: 'mother',    phonetic: '[ˈmʌðə(r)]',   chinese: '母亲, 妈妈',             stage: 'primary', difficulty: 2 , exampleSentence: "His mother and father are both doctors. 他的父母都是医生。" , mnemonic: "同根：motherly / motherless" },
  { id: 'wd_dad',       english: 'dad',       phonetic: '[dæd]',        chinese: '爸爸',                   stage: 'primary', difficulty: 1 , exampleSentence: "She lives with her mom and dad. 她和爸爸妈妈一起住。" , mnemonic: "同根：daddy" },
  { id: 'wd_mom',       english: 'mom',       phonetic: '[mɒm]',        chinese: '妈妈',                   stage: 'primary', difficulty: 1 , exampleSentence: "We waited for Mom and Dad to get home. 我们等着爸爸妈妈回家。" },
  { id: 'wd_parent',    english: 'parent',    phonetic: '[ˈpeərənt]',   chinese: '父亲或母亲, 家长',       stage: 'primary', difficulty: 3 , exampleSentence: "Children under 14 should be accompanied by a parent. 14 岁以下儿童须由一位家长陪同。" , mnemonic: "同根：parental / parentless" },
  { id: 'wd_brother',   english: 'brother',   phonetic: '[ˈbrʌðə(r)]',  chinese: '兄, 弟',                 stage: 'primary', difficulty: 2 , exampleSentence: "I have two brothers, William and Mark. 我有两个兄弟，威廉和马克。" , mnemonic: "同根：brotherly / brotherhood" },
  { id: 'wd_sister',    english: 'sister',    phonetic: '[ˈsɪstə(r)]',  chinese: '姐, 妹',                 stage: 'primary', difficulty: 2 , exampleSentence: "Janet and Abby are sisters. 珍妮特和阿比是两姐妹。" , mnemonic: "同根：sisterly / sis" },
  { id: 'wd_grandma',   english: 'grandma',   phonetic: '[ˈɡrænmɑː]',   chinese: '奶奶, 外婆',             stage: 'primary', difficulty: 2, mnemonic: 'grand + ma = 大妈妈' , exampleSentence: "Grandma was from Scotland. 奶奶来自苏格兰。" },
  { id: 'wd_grandpa',   english: 'grandpa',   phonetic: '[ˈɡrænpɑː]',   chinese: '爷爷, 外公',             stage: 'primary', difficulty: 2 , exampleSentence: "Grandpa was not yet back from the war. 爷爷那时还没从战场归来。" },
  { id: 'wd_baby',      english: 'baby',      phonetic: '[ˈbeɪbi]',     chinese: '婴儿',                   stage: 'primary', difficulty: 1 , exampleSentence: "The baby is crying. 宝宝在哭。" , mnemonic: "同根：babyish / babe" },
  { id: 'wd_friend',    english: 'friend',    phonetic: '[frend]',      chinese: '朋友',                   stage: 'primary', difficulty: 2 , exampleSentence: "Jerry, this is my friend Sue. 杰里，这是我的朋友休。" , mnemonic: "同根：friendly / friendless" },
  { id: 'wd_boy',       english: 'boy',       phonetic: '[bɔɪ]',        chinese: '男孩',                   stage: 'primary', difficulty: 1 , exampleSentence: "The boys wanted to play football. 男孩子们想踢足球。" , mnemonic: "同根：boyish / boyhood" },
  { id: 'wd_girl',      english: 'girl',      phonetic: '[ɡɜːl]',       chinese: '女孩',                   stage: 'primary', difficulty: 1 , exampleSentence: "Both boys and girls can apply to join the choir. 男孩和女孩均可申请加入合唱团。" , mnemonic: "同根：girlish / girlishly" },
  { id: 'wd_man',       english: 'man',       phonetic: '[mæn]',        chinese: '男人, 男子',             stage: 'primary', difficulty: 1 , exampleSentence: "There were two men and a woman in the car. 车上有两男一女。" , mnemonic: "同根：manly / manned" },
  { id: 'wd_woman',     english: 'woman',     phonetic: '[ˈwʊmən]',    chinese: '女人, 女子',             stage: 'primary', difficulty: 2 , exampleSentence: "I was talking to a woman I met on the flight. 我正和一个在飞机上认识的女子交谈。" , mnemonic: "同根：womanish / womanlike" },
  { id: 'wd_people',    english: 'people',    phonetic: '[ˈpiːpl]',     chinese: '人们, 大家',             stage: 'primary', difficulty: 2 , exampleSentence: "How many people were at the meeting? 有多少人到会？" },
  { id: 'wd_kid',       english: 'kid',       phonetic: '[kɪd]',        chinese: '小孩, 孩子',             stage: 'primary', difficulty: 2 , exampleSentence: "She’d always loved animals since she was a little kid. 她从小就喜爱动物。" , mnemonic: "同根：kiddy" },
  { id: 'wd_person',    english: 'person',    phonetic: '[ˈpɜːsn]',     chinese: '人, 个体',               stage: 'primary', difficulty: 3 , exampleSentence: "He was a very nice person, always pleasant and friendly. 他是个很好的人，始终彬彬有礼。" , mnemonic: "同根：personal / personable" },

  // ============================================================
  // 4. 人称代词 + 物主代词
  // ============================================================
  { id: 'wd_i',         english: 'I',         phonetic: '[aɪ]',         chinese: '我',                     stage: 'primary', difficulty: 1 , exampleSentence: "I moved to this city six years ago. 六年前我搬到了这个城市。" },
  { id: 'wd_you',       english: 'you',       phonetic: '[juː]',        chinese: '你, 你们',               stage: 'primary', difficulty: 1 , exampleSentence: "Hi, Kelly. How are you? 嗨，凯利，你好吗？" },
  { id: 'wd_he',        english: 'he',        phonetic: '[hiː]',        chinese: '他',                     stage: 'primary', difficulty: 1 , exampleSentence: "‘Where’s Paul?’ ‘He’s gone to the cinema.’ “保罗在哪儿？”“他去看电影了。”" },
  { id: 'wd_she',       english: 'she',       phonetic: '[ʃiː]',        chinese: '她',                     stage: 'primary', difficulty: 1 , exampleSentence: "You could always ask Beth – she’s got plenty of money. 你总是可以去问贝丝——她有很多钱。" },
  { id: 'wd_we',        english: 'we',        phonetic: '[wiː]',        chinese: '我们',                   stage: 'primary', difficulty: 1 , exampleSentence: "‘Did you go into the supermarket?’ ‘No, we didn’t.’ “你们进超级市场了吗？”“我们没有进去。”" },
  { id: 'wd_they',      english: 'they',      phonetic: '[ðeɪ]',        chinese: '他们, 她们, 它们',       stage: 'primary', difficulty: 1 , exampleSentence: "Bob and Sue said they wouldn’t be able to come. 鲍勃和休说他们来不了。" },
  { id: 'wd_it',        english: 'it',        phonetic: '[ɪt]',         chinese: '它',                     stage: 'primary', difficulty: 1 , exampleSentence: "‘Where’s your office?’ ‘It’s on the third floor.’ “你的办公室在哪儿？”“在三楼。”" },
  { id: 'wd_me',        english: 'me',        phonetic: '[miː]',        chinese: '我(宾格)',               stage: 'primary', difficulty: 1 , exampleSentence: "Stop, you’re hurting me. 住手，你弄疼我了。" },
  { id: 'wd_my',        english: 'my',        phonetic: '[maɪ]',        chinese: '我的',                   stage: 'primary', difficulty: 1 , exampleSentence: "All my friends do not smoke. 我的朋友并不全都吸烟。" },
  { id: 'wd_your',      english: 'your',      phonetic: '[jɔː(r)]',     chinese: '你的, 你们的',           stage: 'primary', difficulty: 1 , exampleSentence: "You should keep in with your colleagues. 你应当与你的同事友好相处。" },
  { id: 'wd_his',       english: 'his',       phonetic: '[hɪz]',        chinese: '他的',                   stage: 'primary', difficulty: 1 , exampleSentence: "That should be his mother. 那大概是他的母亲。" },
  { id: 'wd_her',       english: 'her',       phonetic: '[hɜː(r)]',     chinese: '她的, 她的(宾格)',       stage: 'primary', difficulty: 2 , exampleSentence: "Jane? I don’t really know her. 简？我不太认识她。" },
  { id: 'wd_our',       english: 'our',       phonetic: '[ˈaʊə(r)]',    chinese: '我们的',                 stage: 'primary', difficulty: 2 , exampleSentence: "They partook of our triumph. 他们分享我们的胜利。" },
  { id: 'wd_their',     english: 'their',     phonetic: '[ðeə(r)]',     chinese: '他们的',                 stage: 'primary', difficulty: 2 , exampleSentence: "They talked her round to their position. 他们说服她同意他们的看法。" },
  { id: 'wd_its',       english: 'its',       phonetic: '[ɪts]',        chinese: '它的',                   stage: 'primary', difficulty: 2 , exampleSentence: "He emphasized its importance to me. 他向我强调它的重要性。" },

  // ============================================================
  // 5. 颜色
  // ============================================================
  { id: 'wd_color',     english: 'color',     phonetic: '[ˈkʌlə(r)]',   chinese: '颜色',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_red',       english: 'red',       phonetic: '[red]',        chinese: '红色; 红色的',           stage: 'primary', difficulty: 1 , exampleSentence: "I like the way the artist uses red in this painting. 我喜欢画家在这幅作品中对红色的运用。" , mnemonic: "同根：redly / redness" },
  { id: 'wd_blue',      english: 'blue',      phonetic: '[bluː]',       chinese: '蓝色; 蓝色的',           stage: 'primary', difficulty: 1 , exampleSentence: "She nearly always dresses in blue. 她几乎总是穿蓝色的衣服。" , mnemonic: "同根：bluish / blueing" },
  { id: 'wd_green',     english: 'green',     phonetic: '[ɡriːn]',      chinese: '绿色; 绿色的',           stage: 'primary', difficulty: 1 , exampleSentence: "beautiful green eyes 漂亮的碧眼" , mnemonic: "同根：greenish / greenly" },
  { id: 'wd_yellow',    english: 'yellow',    phonetic: '[ˈjeləʊ]',    chinese: '黄色; 黄色的',           stage: 'primary', difficulty: 1 , exampleSentence: "yellow flowers 黄花" , mnemonic: "同根：yellowish / yellowness" },
  { id: 'wd_black',     english: 'black',     phonetic: '[blæk]',       chinese: '黑色; 黑色的',           stage: 'primary', difficulty: 1 , exampleSentence: "a black evening dress 黑色晚礼服" , mnemonic: "同根：blackish / blackness" },
  { id: 'wd_white',     english: 'white',     phonetic: '[waɪt]',       chinese: '白色; 白色的',           stage: 'primary', difficulty: 1 , exampleSentence: "a white dress 白色连衣裙" , mnemonic: "同根：whitish / whitening" },
  { id: 'wd_orange',    english: 'orange',    phonetic: '[ˈɒrɪndʒ]',    chinese: '橙色; 橙色的',           stage: 'primary', difficulty: 2 , exampleSentence: "orange juice 橙汁" },
  { id: 'wd_pink',      english: 'pink',      phonetic: '[pɪŋk]',       chinese: '粉色; 粉色的',           stage: 'primary', difficulty: 2 , exampleSentence: "Her room was decorated in bright pinks and purples. 她的房间装饰成明亮的粉红色和紫色。" , mnemonic: "同根：pinky / pinkish" },
  { id: 'wd_purple',    english: 'purple',    phonetic: '[ˈpɜːpl]',     chinese: '紫色; 紫色的',           stage: 'primary', difficulty: 2 , exampleSentence: "His face turned purple with rage. 他气得脸色发紫。" , mnemonic: "同根：purplish" },
  { id: 'wd_brown',     english: 'brown',     phonetic: '[braʊn]',      chinese: '棕色; 棕色的',           stage: 'primary', difficulty: 2 , exampleSentence: "dark brown hair 深褐色的头发" , mnemonic: "同根：brownish / browning" },
  { id: 'wd_grey',      english: 'grey',      phonetic: '[ɡreɪ]',       chinese: '灰色; 灰色的',           stage: 'primary', difficulty: 3 , exampleSentence: "an old lady with grey hair 头发灰白的老太太" , mnemonic: "同根：greyish / greyly" },

  // ============================================================
  // 6. 教室 + 学习用品
  // ============================================================
  { id: 'wd_school',    english: 'school',    phonetic: '[skuːl]',      chinese: '学校',                   stage: 'primary', difficulty: 1 , exampleSentence: "His mother always used to pick him up from school. 他母亲以前一直去学校接他。" , mnemonic: "同根：schooling" },
  { id: 'wd_class',     english: 'class',     phonetic: '[klɑːs]',      chinese: '班级; 课',               stage: 'primary', difficulty: 2 , exampleSentence: "He had to spend about six months in a class with younger students. 他不得不在一个比他小的学生的班上呆了大约六个月。" , mnemonic: "同根：classified / classy" },
  { id: 'wd_classroom', english: 'classroom', phonetic: '[ˈklɑːsruːm]', chinese: '教室',                   stage: 'primary', difficulty: 3 , exampleSentence: "The boy bounced out of the classroom. 那男孩突然从教室里奔出去。" },
  { id: 'wd_teacher',   english: 'teacher',   phonetic: '[ˈtiːtʃə(r)]', chinese: '老师, 教师',             stage: 'primary', difficulty: 2 , exampleSentence: "a primary school teacher 小学教师" , mnemonic: "同根：teachable / teaching" },
  { id: 'wd_student',   english: 'student',   phonetic: '[ˈstjuːdnt]',  chinese: '学生',                   stage: 'primary', difficulty: 2 , exampleSentence: "Warren's eldest son is an art student. 沃伦的长子是一名学艺术的学生。" , mnemonic: "同根：studentship" },
  { id: 'wd_pupil',     english: 'pupil',     phonetic: '[ˈpjuːpl]',    chinese: '小学生; 瞳孔',           stage: 'primary', difficulty: 3 , exampleSentence: "About 20 pupils study music here. 大约20名小学生在这里学习音乐。" , mnemonic: "同根：pupillary" },
  { id: 'wd_book',      english: 'book',      phonetic: '[bʊk]',        chinese: '书, 本子',               stage: 'primary', difficulty: 1 , exampleSentence: "I’ve just started reading a book by Graham Greene. 我刚开始看格雷厄姆·格林写的一本书。" , mnemonic: "同根：bookish / bookable" },
  { id: 'wd_pen',       english: 'pen',       phonetic: '[pen]',        chinese: '钢笔',                   stage: 'primary', difficulty: 1 , exampleSentence: "a ballpoint pen 圆珠笔" , mnemonic: "同根：pent / penner" },
  { id: 'wd_pencil',    english: 'pencil',    phonetic: '[ˈpensl]',     chinese: '铅笔',                   stage: 'primary', difficulty: 1 , exampleSentence: "a sharp pencil 尖尖的铅笔" , mnemonic: "同根：penciled / pencilled" },
  { id: 'wd_ruler',     english: 'ruler',     phonetic: '[ˈruːlə(r)]',  chinese: '尺子',                   stage: 'primary', difficulty: 2 , exampleSentence: "a 12-inch ruler 一把12英寸的尺子" , mnemonic: "同根：ruling / ruled" },
  { id: 'wd_eraser',    english: 'eraser',    phonetic: '[ɪˈreɪzə(r)]', chinese: '橡皮',                   stage: 'primary', difficulty: 2 , mnemonic: "同根：erasable / erasure" },
  { id: 'wd_bag',       english: 'bag',       phonetic: '[bæɡ]',        chinese: '包; 书包',               stage: 'primary', difficulty: 1, mnemonic: '背(bèi)上 bag 去学校' , exampleSentence: "...a bag of sweets. …一袋糖果。" },
  { id: 'wd_desk',      english: 'desk',      phonetic: '[desk]',       chinese: '书桌',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_chair',     english: 'chair',     phonetic: '[tʃeə(r)]',    chinese: '椅子',                   stage: 'primary', difficulty: 1 , exampleSentence: "a kitchen chair 厨房椅" , mnemonic: "同根：chairmanship" },
  { id: 'wd_table',     english: 'table',     phonetic: '[ˈteɪbl]',     chinese: '桌子, 台子',             stage: 'primary', difficulty: 1 , exampleSentence: "The food was served on long tables. 食物放在长餐桌上供应。" , mnemonic: "同根：tab" },
  { id: 'wd_door',      english: 'door',      phonetic: '[dɔː(r)]',     chinese: '门',                     stage: 'primary', difficulty: 1 , exampleSentence: "Could you open the door for me? 请你帮我开门好吗？" },
  { id: 'wd_window',    english: 'window',    phonetic: '[ˈwɪndəʊ]',    chinese: '窗户',                   stage: 'primary', difficulty: 2 , exampleSentence: "Television provides us with a useful window on the world. 电视为我们提供了了解世界的有用渠道。" },
  { id: 'wd_board',     english: 'board',     phonetic: '[bɔːd]',       chinese: '木板; 黑板',             stage: 'primary', difficulty: 2 , exampleSentence: "Martha was chopping vegetables on a wooden board. 玛莎正在用一块木砧板切蔬菜。" , mnemonic: "同根：boarding / boarder" },
  { id: 'wd_paper',     english: 'paper',     phonetic: '[ˈpeɪpə(r)]',  chinese: '纸; 报纸',               stage: 'primary', difficulty: 2 , exampleSentence: "I’ll get you a piece of paper so you can write the number down. 我给你找张纸，你好把号码写下来。" , mnemonic: "同根：papery" },
  { id: 'wd_picture',   english: 'picture',   phonetic: '[ˈpɪktʃə(r)]', chinese: '图画, 照片',             stage: 'primary', difficulty: 2 , exampleSentence: "The room had several pictures on the walls. 那个房间墙上有几幅画。" , mnemonic: "同根：picturesque" },
  { id: 'wd_map',       english: 'map',       phonetic: '[mæp]',        chinese: '地图',                   stage: 'primary', difficulty: 2 , exampleSentence: "He spent the next fifteen years mapping the Isle of Anglesey. 他在后来的十五年里绘制了安格尔西岛的地图。" , mnemonic: "同根：mappable / mapping" },
  { id: 'wd_dictionary',english: 'dictionary',phonetic: '[ˈdɪkʃənri]',  chinese: '词典',                   stage: 'primary', difficulty: 4 , exampleSentence: "a German-English dictionary 一本德英词典" },

  // ============================================================
  // 7. 学科
  // ============================================================
  { id: 'wd_lesson',    english: 'lesson',    phonetic: '[ˈlesn]',      chinese: '课; 功课',               stage: 'primary', difficulty: 3 , exampleSentence: "piano lessons 钢琴课" },
  { id: 'wd_math',      english: 'math',      phonetic: '[mæθ]',        chinese: '数学',                   stage: 'primary', difficulty: 2 , exampleSentence: "Tim’s good at math and science. 蒂姆的数学和自然科学很好。" , mnemonic: "同根：mathematical / mathematically" },
  { id: 'wd_Chinese',   english: 'Chinese',   phonetic: '[ˌtʃaɪˈniːz]', chinese: '中文, 语文',             stage: 'primary', difficulty: 2 , exampleSentence: "Do you fancy going out for a Chinese? 你想不想出去吃顿中餐？" },
  { id: 'wd_English',   english: 'English',   phonetic: '[ˈɪŋɡlɪʃ]',    chinese: '英语, 英文',             stage: 'primary', difficulty: 2 , exampleSentence: "the English countryside 英格兰乡村" },
  { id: 'wd_music',     english: 'music',     phonetic: '[ˈmjuːzɪk]',   chinese: '音乐',                   stage: 'primary', difficulty: 2 , exampleSentence: "I often listen to classic music when I’m in the car. 我在车上经常听古典音乐。" , mnemonic: "同根：musical / musically" },
  { id: 'wd_art',       english: 'art',       phonetic: '[ɑːt]',        chinese: '艺术; 美术',             stage: 'primary', difficulty: 2 , exampleSentence: "the Museum of Modern Art in New York 纽约现代艺术博物馆" , mnemonic: "同根：arty / artist" },
  { id: 'wd_science',   english: 'science',   phonetic: '[ˈsaɪəns]',    chinese: '科学',                   stage: 'primary', difficulty: 3 , exampleSentence: "Many leading scientists do not consider that science can give absolutely reliable knowledge. 许多杰出科学家都不认为科学能够提供绝对可靠的知识。" , mnemonic: "同根：scientific / scientifically" },
  { id: 'wd_pe',        english: 'PE',        phonetic: '[ˌpiːˈiː]',    chinese: '体育',                   stage: 'primary', difficulty: 3 },
  { id: 'wd_history',   english: 'history',   phonetic: '[ˈhɪstri]',    chinese: '历史',                   stage: 'primary', difficulty: 4 , exampleSentence: "Throughout history the achievements of women have been largely ignored. 从古至今，妇女的成就都被大大地忽视了。" , mnemonic: "同根：historical / historic" },

  // ============================================================
  // 8. 身体部位
  // ============================================================
  { id: 'wd_body',      english: 'body',      phonetic: '[ˈbɒdi]',      chinese: '身体',                   stage: 'primary', difficulty: 3 , exampleSentence: "the human body 人体" , mnemonic: "同根：bodily / bod" },
  { id: 'wd_head',      english: 'head',      phonetic: '[hed]',        chinese: '头, 头部',               stage: 'primary', difficulty: 1 , exampleSentence: "He kissed the top of her head. 他吻了一下她的头顶。" , mnemonic: "同根：headed / heady" },
  { id: 'wd_face',      english: 'face',      phonetic: '[feɪs]',       chinese: '脸',                     stage: 'primary', difficulty: 2 , exampleSentence: "She had a beautiful face. 她面容秀美。" , mnemonic: "同根：facial / faced" },
  { id: 'wd_eye',       english: 'eye',       phonetic: '[aɪ]',         chinese: '眼睛',                   stage: 'primary', difficulty: 1 , exampleSentence: "He’s got beautiful eyes. 他有一双漂亮的眼睛。" , mnemonic: "同根：eyeable / eyed" },
  { id: 'wd_ear',       english: 'ear',       phonetic: '[ɪə(r)]',      chinese: '耳朵',                   stage: 'primary', difficulty: 2 , exampleSentence: "She tucked her hair behind her ears. 她把头发拢到耳朵背后。" , mnemonic: "同根：eared / earless" },
  { id: 'wd_nose',      english: 'nose',      phonetic: '[nəʊz]',       chinese: '鼻子',                   stage: 'primary', difficulty: 1 , exampleSentence: "Someone punched him on the nose. 有人一拳打在他的鼻子上。" , mnemonic: "同根：nosy / nosey" },
  { id: 'wd_mouth',     english: 'mouth',     phonetic: '[maʊθ]',       chinese: '嘴, 口',                 stage: 'primary', difficulty: 2 , exampleSentence: "He lifted his glass to his mouth. 他把玻璃杯举到嘴边。" , mnemonic: "同根：mouthless" },
  { id: 'wd_tooth',     english: 'tooth',     phonetic: '[tuːθ]',       chinese: '牙齿',                   stage: 'primary', difficulty: 3 , exampleSentence: "Sugar is bad for your teeth. 糖对牙齿不好。" , mnemonic: "同根：toothless / toothed" },
  { id: 'wd_hair',      english: 'hair',      phonetic: '[heə(r)]',     chinese: '头发; 毛发',             stage: 'primary', difficulty: 2 , exampleSentence: "Her hair was short and dark. 她的头发又短又黑。" , mnemonic: "同根：hairy / haired" },
  { id: 'wd_hand',      english: 'hand',      phonetic: '[hænd]',       chinese: '手',                     stage: 'primary', difficulty: 1 , exampleSentence: "Steve gripped the steering wheel tightly with both hands. 史蒂夫双手紧握方向盘。" , mnemonic: "同根：handy / handed" },
  { id: 'wd_arm',       english: 'arm',       phonetic: '[ɑːm]',        chinese: '手臂, 胳膊',             stage: 'primary', difficulty: 3 , exampleSentence: "Dave has a broken arm . 戴夫手臂断了。" , mnemonic: "同根：armed / armored" },
  { id: 'wd_leg',       english: 'leg',       phonetic: '[leɡ]',        chinese: '腿',                     stage: 'primary', difficulty: 2 , exampleSentence: "a young boy with skinny legs 双腿干瘦的小男孩" , mnemonic: "同根：legged / leggy" },
  { id: 'wd_foot',      english: 'foot',      phonetic: '[fʊt]',        chinese: '脚; 英尺',               stage: 'primary', difficulty: 2 , exampleSentence: "My foot hurts. 我脚痛。" , mnemonic: "同根：footage / footing" },
  { id: 'wd_finger',    english: 'finger',    phonetic: '[ˈfɪŋɡə(r)]',  chinese: '手指',                   stage: 'primary', difficulty: 3 , exampleSentence: "The woman had a ring on her finger, so I assumed she was married. 那女人手指上戴着戒指，因此我猜想她已经结婚了。" , mnemonic: "同根：fingered / fingerless" },

  // ============================================================
  // 9. 动物
  // ============================================================
  { id: 'wd_cat',       english: 'cat',       phonetic: '[kæt]',        chinese: '猫',                     stage: 'primary', difficulty: 1, mnemonic: '小猫 cat 喵喵喵' , exampleSentence: "The police played an elaborate game of cat and mouse to trap him. 警方跟他玩了一场精心布局的猫捉老鼠游戏，诱他落网。" },
  { id: 'wd_dog',       english: 'dog',       phonetic: '[dɒɡ]',        chinese: '狗',                     stage: 'primary', difficulty: 1, mnemonic: '小狗 dog 看家汪汪叫' , exampleSentence: "I could hear a dog barking . 我听到了狗吠声。" },
  { id: 'wd_fish',      english: 'fish',      phonetic: '[fɪʃ]',        chinese: '鱼; 鱼肉',               stage: 'primary', difficulty: 1 , exampleSentence: "Dad really loves to fish. 爸爸很喜欢钓鱼。" , mnemonic: "同根：fishing / fishy" },
  { id: 'wd_bird',      english: 'bird',      phonetic: '[bɜːd]',       chinese: '鸟, 禽',                 stage: 'primary', difficulty: 1 , exampleSentence: "wild birds 野鸟" , mnemonic: "同根：birdlike / birder" },
  { id: 'wd_duck',      english: 'duck',      phonetic: '[dʌk]',        chinese: '鸭子',                   stage: 'primary', difficulty: 1 , exampleSentence: "roast duck with orange sauce 烤鸭配橘子酱" , mnemonic: "同根：duckling / ducking" },
  { id: 'wd_chicken',   english: 'chicken',   phonetic: '[ˈtʃɪkɪn]',    chinese: '鸡; 鸡肉',               stage: 'primary', difficulty: 2 , exampleSentence: "roast chicken 烤鸡" , mnemonic: "同根：chick" },
  { id: 'wd_pig',       english: 'pig',       phonetic: '[pɪɡ]',        chinese: '猪',                     stage: 'primary', difficulty: 2, mnemonic: 'pig 是爱滚泥巴的猪' , exampleSentence: "He kept pigs and poultry. 他养过猪和家禽。" },
  { id: 'wd_cow',       english: 'cow',       phonetic: '[kaʊ]',        chinese: '母牛; 奶牛',             stage: 'primary', difficulty: 2 , exampleSentence: "a herd of cows 一群牛" , mnemonic: "同根：cowy" },
  { id: 'wd_horse',     english: 'horse',     phonetic: '[hɔːs]',       chinese: '马',                     stage: 'primary', difficulty: 2 , exampleSentence: "a horse and cart 一辆马车" },
  { id: 'wd_sheep',     english: 'sheep',     phonetic: '[ʃiːp]',       chinese: '绵羊',                   stage: 'primary', difficulty: 2 , exampleSentence: "Sheep were grazing on the hillside. 羊群在山坡上吃草。" },
  { id: 'wd_rabbit',    english: 'rabbit',    phonetic: '[ˈræbɪt]',     chinese: '兔子',                   stage: 'primary', difficulty: 3 , exampleSentence: "The rabbit disappeared in the bushes. 那只兔子消失在树丛中。" },
  { id: 'wd_tiger',     english: 'tiger',     phonetic: '[ˈtaɪɡə(r)]',  chinese: '老虎',                   stage: 'primary', difficulty: 4, mnemonic: '泰山 tiger' , exampleSentence: "The trainer backed away from the enraged tiger. 驯兽师从被激怒的老虎身旁往后退。" },
  { id: 'wd_lion',      english: 'lion',      phonetic: '[ˈlaɪən]',     chinese: '狮子',                   stage: 'primary', difficulty: 4, mnemonic: 'L(躺)+ion → 狮子躺着' },
  { id: 'wd_elephant',  english: 'elephant',  phonetic: '[ˈelɪfənt]',   chinese: '大象',                   stage: 'primary', difficulty: 5 , exampleSentence: "Tom: No.Although 75% of its raw materials is elephant dung, it is light delicate fragrance instead of stink. This is due to its special fabrication technology. 不，尽管这种纸里75％的原料都是大象的粪便，但它不但不臭，反而有一种淡淡的清香，这是源于它的特殊的制造工艺。" },
  { id: 'wd_monkey',    english: 'monkey',    phonetic: '[ˈmʌŋki]',     chinese: '猴子',                   stage: 'primary', difficulty: 4 , exampleSentence: "Stop that, you little monkey! 别这样，你这个小淘气鬼！" },
  { id: 'wd_panda',     english: 'panda',     phonetic: '[ˈpændə]',     chinese: '熊猫',                   stage: 'primary', difficulty: 3 , exampleSentence: "The caged panda chafed against the bars. 笼子里的大熊猫贴在栅栏上蹭它的身体。" },
  { id: 'wd_bear',      english: 'bear',      phonetic: '[beə(r)]',     chinese: '熊',                     stage: 'primary', difficulty: 3 , exampleSentence: "As the plants grow and start to bear fruit they will need a lot of water. 随着植物的生长及开始结果，它们将需要大量的水分。" , mnemonic: "同根：born / bearable" },
  { id: 'wd_fox',       english: 'fox',       phonetic: '[fɒks]',       chinese: '狐狸',                   stage: 'primary', difficulty: 3 , exampleSentence: "We were foxed by the problem. 我们被这个问题难住了。" , mnemonic: "同根：foxy / foxiness" },
  { id: 'wd_animal',    english: 'animal',    phonetic: '[ˈænɪml]',     chinese: '动物; 牲畜',             stage: 'primary', difficulty: 2 , exampleSentence: "furry little animals 毛茸茸的小动物" , mnemonic: "同根：animallike / anime" },
  { id: 'wd_insect',    english: 'insect',    phonetic: '[ˈɪnsekt]',    chinese: '昆虫',                   stage: 'primary', difficulty: 5 , exampleSentence: "an insect bite 昆虫的叮咬" },
  { id: 'wd_butterfly', english: 'butterfly', phonetic: '[ˈbʌtəflaɪ]',  chinese: '蝴蝶',                   stage: 'primary', difficulty: 5 , exampleSentence: "Gwen’s a real social butterfly . 格温是个十足的交际花。" },

  // ============================================================
  // 10. 食物 + 饮料
  // ============================================================
  { id: 'wd_food',      english: 'food',      phonetic: '[fuːd]',       chinese: '食物',                   stage: 'primary', difficulty: 2 , exampleSentence: "The restaurant serves good food at affordable prices. 那家餐厅物美价廉。" },
  { id: 'wd_water',     english: 'water',     phonetic: '[ˈwɔːtə(r)]',  chinese: '水',                     stage: 'primary', difficulty: 1 , exampleSentence: "There’s water all over the bathroom floor. 浴室地面上都是水。" , mnemonic: "同根：watery / watering" },
  { id: 'wd_milk',      english: 'milk',      phonetic: '[mɪlk]',       chinese: '牛奶',                   stage: 'primary', difficulty: 1 , exampleSentence: "a bottle of milk 一瓶奶" , mnemonic: "同根：milky / milker" },
  { id: 'wd_juice',     english: 'juice',     phonetic: '[dʒuːs]',      chinese: '果汁, 饮料',             stage: 'primary', difficulty: 2 , exampleSentence: "a carton of orange juice 一纸盒橙汁" },
  { id: 'wd_tea',       english: 'tea',       phonetic: '[tiː]',        chinese: '茶',                     stage: 'primary', difficulty: 1 , exampleSentence: "Would you like a cup of tea or coffee? 你想来一杯茶还是咖啡？" },
  { id: 'wd_coffee',    english: 'coffee',    phonetic: '[ˈkɒfi]',      chinese: '咖啡',                   stage: 'primary', difficulty: 3 , exampleSentence: "Do you want a cup of coffee? 你要来杯咖啡吗？" },
  { id: 'wd_rice',      english: 'rice',      phonetic: '[raɪs]',       chinese: '米饭; 米',               stage: 'primary', difficulty: 1 , exampleSentence: "a tasty sauce served with rice or pasta 配米饭或意面的美味酱汁" , mnemonic: "同根：ricer" },
  { id: 'wd_bread',     english: 'bread',     phonetic: '[bred]',       chinese: '面包',                   stage: 'primary', difficulty: 1 , exampleSentence: "Would you like some bread with your soup? 你喝汤时要吃点面包吗？" },
  { id: 'wd_egg',       english: 'egg',       phonetic: '[eɡ]',         chinese: '蛋; 鸡蛋',               stage: 'primary', difficulty: 1 , exampleSentence: "Blackbirds lay their eggs in March. 乌鸫在3月产蛋。" , mnemonic: "同根：egger" },
  { id: 'wd_meat',      english: 'meat',      phonetic: '[miːt]',       chinese: '肉',                     stage: 'primary', difficulty: 2 , exampleSentence: "I gave up eating meat a few months ago. 我几个月以前开始不吃肉了。" , mnemonic: "同根：meaty / meatless" },
  { id: 'wd_chicken2',  english: 'chicken',   phonetic: '[ˈtʃɪkɪn]',    chinese: '鸡肉',                   stage: 'primary', difficulty: 2 , exampleSentence: "roast chicken 烤鸡" , mnemonic: "同根：chick" },
  { id: 'wd_cake',      english: 'cake',      phonetic: '[keɪk]',       chinese: '蛋糕; 饼',               stage: 'primary', difficulty: 2 , exampleSentence: "We had cake and ice cream. 我们吃了蛋糕和冰激凌。" , mnemonic: "同根：caky" },
  { id: 'wd_candy',     english: 'candy',     phonetic: '[ˈkændi]',     chinese: '糖果',                   stage: 'primary', difficulty: 2 , exampleSentence: "...a piece of candy. …一块糖果。" , mnemonic: "同根：candied" },
  { id: 'wd_ice',       english: 'ice',       phonetic: '[aɪs]',        chinese: '冰',                     stage: 'primary', difficulty: 1 , exampleSentence: "Would you like some ice in your drink? 你饮料中要放点冰块吗？" , mnemonic: "同根：icy / icily" },
  { id: 'wd_ice_cream', english: 'ice-cream', phonetic: '[ˈaɪs kriːm]', chinese: '冰淇淋',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_cake_fruit',english: 'apple',     phonetic: '[ˈæpl]',       chinese: '苹果',                   stage: 'primary', difficulty: 1 , exampleSentence: "apple pie 苹果馅饼" },
  { id: 'wd_banana',    english: 'banana',    phonetic: '[bəˈnɑːnə]',   chinese: '香蕉',                   stage: 'primary', difficulty: 1 , exampleSentence: "...a bunch of bananas. …一串香蕉。" },
  { id: 'wd_pear',      english: 'pear',      phonetic: '[peə(r)]',     chinese: '梨',                     stage: 'primary', difficulty: 2 , exampleSentence: "I took this apple for a pear until I tasted it. 我误将这个苹果当作梨子，直到我尝了才知道。" },
  { id: 'wd_grape',     english: 'grape',     phonetic: '[ɡreɪp]',      chinese: '葡萄',                   stage: 'primary', difficulty: 2 , exampleSentence: "a bunch of grapes 一串葡萄" , mnemonic: "同根：grapy" },
  { id: 'wd_strawberry',english: 'strawberry',phonetic: '[ˈstrɔːbəri]', chinese: '草莓',                   stage: 'primary', difficulty: 3 , exampleSentence: "...strawberries and cream. …奶油草莓。" },
  { id: 'wd_peach',     english: 'peach',     phonetic: '[piːtʃ]',      chinese: '桃',                     stage: 'primary', difficulty: 3 , exampleSentence: "Anderton scored a peach of a goal. 安德顿射入一个好球。" , mnemonic: "同根：peachy" },
  { id: 'wd_vegetable', english: 'vegetable', phonetic: '[ˈvedʒtəbl]',  chinese: '蔬菜',                   stage: 'primary', difficulty: 3 , exampleSentence: "fresh fruit and vegetables 新鲜果蔬" , mnemonic: "同根：vegetative / vegetal" },
  { id: 'wd_tomato',    english: 'tomato',    phonetic: '[təˈmɑːtəʊ]',  chinese: '番茄, 西红柿',           stage: 'primary', difficulty: 3 , exampleSentence: "He staked his tomato vines with bamboo. 他用竹竿支撑起西红柿秧。" },
  { id: 'wd_potato',    english: 'potato',    phonetic: '[pəˈteɪtəʊ]',  chinese: '土豆, 马铃薯',           stage: 'primary', difficulty: 3 , exampleSentence: "Marie stood at the sink, peeling potatoes (= cutting off the skin ) . 玛丽站在洗涤槽边削土豆皮。" },
  { id: 'wd_carrot',    english: 'carrot',    phonetic: '[ˈkærət]',     chinese: '胡萝卜',                 stage: 'primary', difficulty: 4 , exampleSentence: "grated carrots 磨碎的胡萝卜" , mnemonic: "同根：carroty" },

  // ============================================================
  // 11. 衣物 + 鞋帽
  // ============================================================
  { id: 'wd_clothes',   english: 'clothes',   phonetic: '[kləʊðz]',     chinese: '衣服',                   stage: 'primary', difficulty: 3 , exampleSentence: "What sort of clothes was he wearing? 他穿着什么样的衣服？" },
  { id: 'wd_shirt',     english: 'shirt',     phonetic: '[ʃɜːt]',       chinese: '衬衫, T恤',              stage: 'primary', difficulty: 2 , exampleSentence: "I have to wear a shirt and tie to work. 我上班要穿衬衫打领带。" , mnemonic: "同根：shirting" },
  { id: 'wd_T_shirt',   english: 'T-shirt',   phonetic: '[ˈtiː ʃɜːt]',  chinese: 'T恤衫',                  stage: 'primary', difficulty: 3 },
  { id: 'wd_pants',     english: 'pants',     phonetic: '[pænts]',      chinese: '裤子',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_skirt',     english: 'skirt',     phonetic: '[skɜːt]',      chinese: '裙子',                   stage: 'primary', difficulty: 3 , exampleSentence: "She wore a white blouse and a plain black skirt. 她穿着白衬衣和纯黑的裙子。" , mnemonic: "同根：skirting" },
  { id: 'wd_dress',     english: 'dress',     phonetic: '[dres]',       chinese: '连衣裙; 服装',           stage: 'primary', difficulty: 2 , exampleSentence: "Can you wait a minute? I’m just getting dressed . 稍等一会儿，我穿下衣服就好。" , mnemonic: "同根：dressed / dressy" },
  { id: 'wd_coat',      english: 'coat',      phonetic: '[kəʊt]',       chinese: '外套, 大衣',             stage: 'primary', difficulty: 2 , exampleSentence: "Billy! Put your coat on , it’s cold outside! 比利！穿上外套，外面很冷！" , mnemonic: "同根：coated / coating" },
  { id: 'wd_jacket',    english: 'jacket',    phonetic: '[ˈdʒækɪt]',    chinese: '夹克',                   stage: 'primary', difficulty: 3 , exampleSentence: "Gene has to wear a jacket and tie to work. 吉恩上班得穿西装打领带。" },
  { id: 'wd_hat',       english: 'hat',       phonetic: '[hæt]',        chinese: '帽子',                   stage: 'primary', difficulty: 2 , exampleSentence: "Maria was wearing a beautiful new hat. 玛丽亚戴着一顶漂亮的新帽子。" , mnemonic: "同根：hatless / hatted" },
  { id: 'wd_cap',       english: 'cap',       phonetic: '[kæp]',        chinese: '便帽, 鸭舌帽',           stage: 'primary', difficulty: 2 , exampleSentence: "Make sure you put the cap back on the pen. 一定要把笔帽套上。" , mnemonic: "同根：capped / capless" },
  { id: 'wd_shoe',      english: 'shoe',      phonetic: '[ʃuː]',        chinese: '鞋',                     stage: 'primary', difficulty: 2 , exampleSentence: "I sat down and took off my shoes and socks. 我坐下来脱掉鞋子和袜子。" , mnemonic: "同根：shod / shoeless" },
  { id: 'wd_sock',      english: 'sock',      phonetic: '[sɒk]',        chinese: '袜子',                   stage: 'primary', difficulty: 2 , exampleSentence: "a pair of socks 一双短袜" },
  { id: 'wd_gloves',    english: 'gloves',    phonetic: '[ɡlʌvz]',      chinese: '手套',                   stage: 'primary', difficulty: 4 },
  { id: 'wd_scarf',     english: 'scarf',     phonetic: '[skɑːf]',      chinese: '围巾; 头巾',             stage: 'primary', difficulty: 4 , exampleSentence: "He reached up to loosen the scarf around his neck. 他伸出手松开围在脖子上的围巾。" },

  // ============================================================
  // 12. 交通工具
  // ============================================================
  { id: 'wd_car',       english: 'car',       phonetic: '[kɑː(r)]',     chinese: '汽车; 小汽车',           stage: 'primary', difficulty: 1 , exampleSentence: "Dan got out of the car and locked the door. 丹下了车，锁上车门。" },
  { id: 'wd_bus',       english: 'bus',       phonetic: '[bʌs]',        chinese: '公共汽车',               stage: 'primary', difficulty: 1 , exampleSentence: "I took a bus to San Francisco. 我乘公共汽车去旧金山。" , mnemonic: "同根：busboy" },
  { id: 'wd_bike',      english: 'bike',      phonetic: '[baɪk]',       chinese: '自行车',                 stage: 'primary', difficulty: 2 , exampleSentence: "Let’s go for a bike ride . 我们去骑会儿自行车吧。" },
  { id: 'wd_train',     english: 'train',     phonetic: '[treɪn]',      chinese: '火车',                   stage: 'primary', difficulty: 2 , exampleSentence: "We went all the way to Inverness by train. 我们一路坐火车到因弗内斯。" , mnemonic: "同根：trained / training" },
  { id: 'wd_plane',     english: 'plane',     phonetic: '[pleɪn]',      chinese: '飞机',                   stage: 'primary', difficulty: 2 , exampleSentence: "It is a big airline with a large fleet of planes. 这是一家大航空公司，拥有庞大的机群。" , mnemonic: "同根：planer / planation" },
  { id: 'wd_ship',      english: 'ship',      phonetic: '[ʃɪp]',        chinese: '船, 轮船',               stage: 'primary', difficulty: 2 , exampleSentence: "We'll ship your order to the address we print on your cheques. 我们将把你预订的货物送到我们印在你单据上的地址。" , mnemonic: "同根：shipping / shipper" },
  { id: 'wd_boat',      english: 'boat',      phonetic: '[bəʊt]',       chinese: '小船, 舟',               stage: 'primary', difficulty: 2 , exampleSentence: "a fishing boat 渔船" , mnemonic: "同根：boating / boater" },
  { id: 'wd_taxi',      english: 'taxi',      phonetic: '[ˈtæksi]',     chinese: '出租车',                 stage: 'primary', difficulty: 3 , exampleSentence: "The plane taxied to a halt. 飞机滑行一段距离后停下来。" , mnemonic: "同根：taxiway" },

  // ============================================================
  // 13. 地点 + 房间
  // ============================================================
  { id: 'wd_home',      english: 'home',      phonetic: '[həʊm]',       chinese: '家',                     stage: 'primary', difficulty: 1 , exampleSentence: "They have a beautiful home in California. 他们在加州有个美丽的家。" , mnemonic: "同根：homeless / homely" },
  { id: 'wd_room',      english: 'room',      phonetic: '[ruːm]',       chinese: '房间',                   stage: 'primary', difficulty: 2 , exampleSentence: "I looked around the room. 我四下看了看房间。" , mnemonic: "同根：roomer / roomful" },
  { id: 'wd_bedroom',   english: 'bedroom',   phonetic: '[ˈbedruːm]',   chinese: '卧室',                   stage: 'primary', difficulty: 3 , exampleSentence: "a hotel with 50 bedrooms 有50间客房的旅馆" , mnemonic: "同根：bedsitter" },
  { id: 'wd_living_room',english:'living room',phonetic:'[ˈlɪvɪŋ ruːm]',chinese: '客厅',                    stage: 'primary', difficulty: 5 },
  { id: 'wd_bathroom',  english: 'bathroom',  phonetic: '[ˈbɑːθruːm]',  chinese: '浴室, 卫生间',           stage: 'primary', difficulty: 4 , exampleSentence: "Where’s the bathroom? 洗手间在哪里？" , mnemonic: "同根：bath" },
  { id: 'wd_kitchen',   english: 'kitchen',   phonetic: '[ˈkɪtʃɪn]',    chinese: '厨房',                   stage: 'primary', difficulty: 4 , exampleSentence: "Sam went into the kitchen to make a pot of tea. 萨姆走进厨房去沏一壶茶。" , mnemonic: "同根：kitchenette / kitchenware" },
  { id: 'wd_garden',    english: 'garden',    phonetic: '[ˈɡɑːdn]',     chinese: '花园, 果园',             stage: 'primary', difficulty: 3 , exampleSentence: "He’s outside in the garden. 他在外面花园里。" , mnemonic: "同根：gardener / gardening" },
  { id: 'wd_park',      english: 'park',      phonetic: '[pɑːk]',       chinese: '公园',                   stage: 'primary', difficulty: 2 , exampleSentence: "Let’s go for a walk in the park. 我们去公园散步吧。" , mnemonic: "同根：parking / parker" },
  { id: 'wd_zoo',       english: 'zoo',       phonetic: '[zuː]',        chinese: '动物园',                 stage: 'primary', difficulty: 2 , exampleSentence: "The road to the zoo turns off here. 通向动物园的路由这儿拐弯。" , mnemonic: "同根：zoological / zoonotic" },
  { id: 'wd_shop',      english: 'shop',      phonetic: '[ʃɒp]',        chinese: '商店; 购物',             stage: 'primary', difficulty: 2 , exampleSentence: "a barber’s shop 理发店" , mnemonic: "同根：shopaholic / shopping" },
  { id: 'wd_store',     english: 'store',     phonetic: '[stɔː(r)]',    chinese: '商店',                   stage: 'primary', difficulty: 2 , exampleSentence: "At Christmas the stores stay open late. 在圣诞节期间，商店营业到很晚。" , mnemonic: "同根：stored / storage" },
  { id: 'wd_market',    english: 'market',    phonetic: '[ˈmɑːkɪt]',    chinese: '市场, 集市',             stage: 'primary', difficulty: 3 , exampleSentence: "Our main overseas market is Japan. 我们的主要海外市场是日本。" , mnemonic: "同根：marketable / marketing" },
  { id: 'wd_hospital',  english: 'hospital',  phonetic: '[ˈhɒspɪtl]',   chinese: '医院',                   stage: 'primary', difficulty: 4 , exampleSentence: "They are building a new hospital. 他们正在建一家新医院。" , mnemonic: "同根：hospitality / hospitalization" },
  { id: 'wd_street',    english: 'street',    phonetic: '[striːt]',     chinese: '街道; 街',               stage: 'primary', difficulty: 3 , exampleSentence: "We moved to Center Street when I was young. 在我小时候，我们搬到了中心大街。" },
  { id: 'wd_road',      english: 'road',      phonetic: '[rəʊd]',       chinese: '路, 道路',               stage: 'primary', difficulty: 2 , exampleSentence: "65 Maple Road 枫树路65号" , mnemonic: "同根：roadless / roadway" },
  { id: 'wd_bridge',    english: 'bridge',    phonetic: '[brɪdʒ]',      chinese: '桥',                     stage: 'primary', difficulty: 3 , exampleSentence: "He walked back over the railway bridge. 他从铁路桥上走了回去。" , mnemonic: "同根：bridgeable" },
  { id: 'wd_city',      english: 'city',      phonetic: '[ˈsɪti]',      chinese: '城市',                   stage: 'primary', difficulty: 2 , exampleSentence: "The nearest big city was St. Louis. 最近的大城市是圣路易斯。" , mnemonic: "同根：citified / cit" },
  { id: 'wd_country',   english: 'country',   phonetic: '[ˈkʌntri]',    chinese: '国家; 乡村',             stage: 'primary', difficulty: 3 , exampleSentence: "travelling to a foreign country 到国外旅行" , mnemonic: "同根：countryside / countryman" },
  { id: 'wd_China',     english: 'China',     phonetic: '[ˈtʃaɪnə]',    chinese: '中国',                   stage: 'primary', difficulty: 2 },
  { id: 'wd_world',     english: 'world',     phonetic: '[wɜːld]',      chinese: '世界',                   stage: 'primary', difficulty: 3 , exampleSentence: "Tuberculosis is still common in some parts of the world . 结核病在世界上某些地区仍很常见。" , mnemonic: "同根：worldly / worldliness" },

  // ============================================================
  // 14. 形状 + 数字单位
  // ============================================================
  { id: 'wd_line',      english: 'line',      phonetic: '[laɪn]',       chinese: '线; 排, 行',             stage: 'primary', difficulty: 3 , exampleSentence: "Draw a straight line across the top of the page. 在这一页的上方画一条直线。" , mnemonic: "同根：lined / liner" },
  { id: 'wd_circle',    english: 'circle',    phonetic: '[ˈsɜːkl]',     chinese: '圆; 圆形',               stage: 'primary', difficulty: 4 , exampleSentence: "Draw a circle 10cm in diameter. 画一个直径10厘米的圆形。" , mnemonic: "同根：circadian / circularly" },
  { id: 'wd_box',       english: 'box',       phonetic: '[bɒks]',       chinese: '盒子; 箱子',             stage: 'primary', difficulty: 1 , exampleSentence: "She ate two boxes of chocolates. 她吃了两盒巧克力。" , mnemonic: "同根：boxed / boxlike" },
  { id: 'wd_ball',      english: 'ball',      phonetic: '[bɔːl]',       chinese: '球',                     stage: 'primary', difficulty: 1 , exampleSentence: "...a golf ball. …一个高尔夫球。" },

  // ============================================================
  // 15. 时间 + 日期
  // ============================================================
  { id: 'wd_time',      english: 'time',      phonetic: '[taɪm]',       chinese: '时间; 次',               stage: 'primary', difficulty: 1 , exampleSentence: "Einstein changed the way we think about space and time. 爱因斯坦改变了我们的时空概念。" , mnemonic: "同根：timely / timeless" },
  { id: 'wd_week',      english: 'week',      phonetic: '[wiːk]',       chinese: '星期; 周',               stage: 'primary', difficulty: 2 , exampleSentence: "I can’t see you this week. 我这星期不能见你。" , mnemonic: "同根：weekly" },
  { id: 'wd_weekend',   english: 'weekend',   phonetic: '[ˌwiːkˈend]',   chinese: '周末',                   stage: 'primary', difficulty: 3 , exampleSentence: "Are you doing anything nice this weekend? 这个周末你有什么好的安排？" , mnemonic: "同根：weekender" },
  { id: 'wd_month',     english: 'month',     phonetic: '[mʌnθ]',       chinese: '月; 月份',               stage: 'primary', difficulty: 3 , exampleSentence: "I hope I’ll have finished the work by the end of the month . 我希望我这个月底能完成工作。" , mnemonic: "同根：monthly" },
  { id: 'wd_year',      english: 'year',      phonetic: '[jɪə(r)]',     chinese: '年; 岁',                 stage: 'primary', difficulty: 1 , exampleSentence: "I arrived here two years ago. 我两年前来到这里。" , mnemonic: "同根：yearly" },
  { id: 'wd_hour',      english: 'hour',      phonetic: '[ˈaʊə(r)]',    chinese: '小时',                   stage: 'primary', difficulty: 3 , exampleSentence: "The interview will last about two hours. 面试大概要持续两小时。" , mnemonic: "同根：hourly" },
  { id: 'wd_minute',    english: 'minute',    phonetic: '[ˈmɪnɪt]',     chinese: '分钟',                   stage: 'primary', difficulty: 3 , exampleSentence: "It takes me ten minutes to walk to work. 我步行上班要用十分钟。" , mnemonic: "同根：minutely / minuteness" },
  { id: 'wd_Monday',    english: 'Monday',    phonetic: '[ˈmʌndeɪ]',    chinese: '星期一',                 stage: 'primary', difficulty: 3 , exampleSentence: "The president announced Monday that he would cancel the debt. 总统周一宣布他会取消这笔债务。" },
  { id: 'wd_Tuesday',   english: 'Tuesday',   phonetic: '[ˈtjuːzdeɪ]',  chinese: '星期二',                 stage: 'primary', difficulty: 4 , exampleSentence: "I’ll see you Tuesday. 星期二见。" },
  { id: 'wd_Wednesday', english: 'Wednesday', phonetic: '[ˈwenzdeɪ]',   chinese: '星期三',                 stage: 'primary', difficulty: 5 , exampleSentence: "Come and have supper with us on Wednesday, if you're free. 星期三过来和我们一起吃晚饭，如果有空的话。" },
  { id: 'wd_Thursday',  english: 'Thursday',  phonetic: '[ˈθɜːzdeɪ]',   chinese: '星期四',                 stage: 'primary', difficulty: 5 , exampleSentence: "She was working Thursday. 她星期四在工作。" },
  { id: 'wd_Friday',    english: 'Friday',    phonetic: '[ˈfraɪdeɪ]',   chinese: '星期五',                 stage: 'primary', difficulty: 3 , exampleSentence: "Diane won’t be here Friday. 星期五黛安娜不来这里。" },
  { id: 'wd_Saturday',  english: 'Saturday',  phonetic: '[ˈsætədeɪ]',   chinese: '星期六',                 stage: 'primary', difficulty: 4 , exampleSentence: "The festivities begin Saturday. 庆祝活动从星期六开始。" },
  { id: 'wd_Sunday',    english: 'Sunday',    phonetic: '[ˈsʌndeɪ]',    chinese: '星期日',                 stage: 'primary', difficulty: 3 , exampleSentence: "What are you doing Sunday? 你星期天做什么？" },

  // ============================================================
  // 16. 天气 + 自然
  // ============================================================
  { id: 'wd_weather',   english: 'weather',   phonetic: '[ˈweðə(r)]',   chinese: '天气',                   stage: 'primary', difficulty: 2 , exampleSentence: "What’s the weather like today? 今天天气如何？" , mnemonic: "同根：weathered / weatherproof" },
  { id: 'wd_sun',       english: 'sun',       phonetic: '[sʌn]',        chinese: '太阳; 阳光',             stage: 'primary', difficulty: 1 , exampleSentence: "The sky was blue and the sun was shining. 天空蔚蓝，阳光明媚。" , mnemonic: "同根：sunny / sunless" },
  { id: 'wd_sunny',     english: 'sunny',     phonetic: '[ˈsʌni]',      chinese: '晴朗的',                 stage: 'primary', difficulty: 2 , exampleSentence: "a warm sunny day 温暖晴朗的一天" , mnemonic: "同根：sunlit / sunless" },
  { id: 'wd_cloud',     english: 'cloud',     phonetic: '[klaʊd]',      chinese: '云',                     stage: 'primary', difficulty: 2 , exampleSentence: "Fears of renewed terrorist attacks cast a cloud over the event (= spoilt the happy situation ) . 对恐怖分子再次发动袭击的担心给这次活动蒙上了一层阴影。" , mnemonic: "同根：cloudy / clouded" },
  { id: 'wd_cloudy',    english: 'cloudy',    phonetic: '[ˈklaʊdi]',    chinese: '多云的',                 stage: 'primary', difficulty: 3 , exampleSentence: "a cloudy night with some light rain 伴有些许小雨的多云的夜晚" , mnemonic: "同根：clouded / cloudless" },
  { id: 'wd_rain',      english: 'rain',      phonetic: '[reɪn]',       chinese: '雨; 下雨',               stage: 'primary', difficulty: 2 , exampleSentence: "a night of wind and rain 风雨交加的夜晚" , mnemonic: "同根：rainy / rainless" },
  { id: 'wd_snow',      english: 'snow',      phonetic: '[snəʊ]',       chinese: '雪; 下雪',               stage: 'primary', difficulty: 2 , exampleSentence: "Snow was falling heavily as we entered the village. 我们进村的时候雪下得正大。" , mnemonic: "同根：snowy" },
  { id: 'wd_wind',      english: 'wind',      phonetic: '[wɪnd]',       chinese: '风',                     stage: 'primary', difficulty: 2 , exampleSentence: "The wind blew from the northeast. 风从东北方向吹来。" , mnemonic: "同根：winding / windy" },
  { id: 'wd_windy',     english: 'windy',     phonetic: '[ˈwɪndi]',     chinese: '有风的',                 stage: 'primary', difficulty: 3 , exampleSentence: "It’s too windy for a picnic. 风太大，不适合野餐。" , mnemonic: "同根：windward / winded" },
  { id: 'wd_hot',       english: 'hot',       phonetic: '[hɒt]',        chinese: '热的; 辣的',             stage: 'primary', difficulty: 1 , exampleSentence: "a hot curry 一种辛辣的咖喱" , mnemonic: "同根：hotheaded / hotly" },
  { id: 'wd_cold',      english: 'cold',      phonetic: '[kəʊld]',      chinese: '冷的; 寒冷的',           stage: 'primary', difficulty: 1 , exampleSentence: "She splashed her face with cold water. 她往脸上泼冷水。" , mnemonic: "同根：coldhearted / coldly" },
  { id: 'wd_warm',      english: 'warm',      phonetic: '[wɔːm]',       chinese: '温暖的; 暖和的',         stage: 'primary', difficulty: 2 , exampleSentence: "The house was lovely and warm. 那房子漂亮温暖。" , mnemonic: "同根：warming / warmly" },
  { id: 'wd_cool',      english: 'cool',      phonetic: '[kuːl]',       chinese: '凉的; 凉爽的',           stage: 'primary', difficulty: 2 , exampleSentence: "She swam out into the cool water. 她往外游向清凉的水里。" , mnemonic: "同根：coolly / cooler" },
  { id: 'wd_sky',       english: 'sky',       phonetic: '[skaɪ]',       chinese: '天空',                   stage: 'primary', difficulty: 3 , exampleSentence: "The sky grew dark, and a cold rain began to fall. 天色转暗，开始下起冰冷的雨来。" , mnemonic: "同根：skyward / skyline" },
  { id: 'wd_tree',      english: 'tree',      phonetic: '[triː]',       chinese: '树, 树木',               stage: 'primary', difficulty: 1 , exampleSentence: "As a kid, I loved to climb trees. 小时候，我喜欢爬树。" , mnemonic: "同根：treed / treeless" },
  { id: 'wd_flower',    english: 'flower',    phonetic: '[ˈflaʊə(r)]',  chinese: '花, 花卉',               stage: 'primary', difficulty: 2 , exampleSentence: "a lovely rose bush with delicate pink flowers 一簇开着娇嫩的粉红色花朵的美丽蔷薇" , mnemonic: "同根：flowery / flowering" },
  { id: 'wd_grass',     english: 'grass',     phonetic: '[ɡrɑːs]',      chinese: '草; 草地',               stage: 'primary', difficulty: 3 , exampleSentence: "I walked across the grass. 我走在草地上。" , mnemonic: "同根：grassy / grassless" },
  { id: 'wd_river',     english: 'river',     phonetic: '[ˈrɪvə(r)]',   chinese: '河, 江',                 stage: 'primary', difficulty: 3 , exampleSentence: "the Mississippi River 密西西比河" },
  { id: 'wd_sea',       english: 'sea',       phonetic: '[siː]',        chinese: '海, 海洋',               stage: 'primary', difficulty: 2 , exampleSentence: "Jay stripped his clothes off and ran into the sea. 杰伊脱光衣服奔入海里。" , mnemonic: "同根：seaward / seamost" },
  { id: 'wd_mountain',  english: 'mountain',  phonetic: '[ˈmaʊntɪn]',   chinese: '山, 山岳',               stage: 'primary', difficulty: 4 , exampleSentence: "the highest mountain in Austria 奥地利最高的山" , mnemonic: "同根：mountainous" },
  { id: 'wd_lake',      english: 'lake',      phonetic: '[leɪk]',       chinese: '湖',                     stage: 'primary', difficulty: 4 , exampleSentence: "Lake Michigan 密歇根湖" },
  { id: 'wd_flower2',   english: 'rose',      phonetic: '[rəʊz]',       chinese: '玫瑰',                   stage: 'primary', difficulty: 4 , exampleSentence: "a dozen red roses 一打红玫瑰" , mnemonic: "同根：rising / rosy" },

  // ============================================================
  // 17. 常用动词
  // ============================================================
  { id: 'wd_go',        english: 'go',        phonetic: '[ɡəʊ]',        chinese: '去; 走',                 stage: 'primary', difficulty: 1 , exampleSentence: "The plate went crashing to the floor. 盘子哗啦一声掉在地板上。" , mnemonic: "同根：gone / going" },
  { id: 'wd_come',      english: 'come',      phonetic: '[kʌm]',        chinese: '来; 到来',               stage: 'primary', difficulty: 1 , exampleSentence: "Let me know when they come. 他们来了就告诉我。" , mnemonic: "同根：coming / comer" },
  { id: 'wd_run',       english: 'run',       phonetic: '[rʌn]',        chinese: '跑, 奔跑',               stage: 'primary', difficulty: 1 , exampleSentence: "Many people don’t care who runs the country. 很多人不在乎由谁统治国家。" , mnemonic: "同根：running / runner" },
  { id: 'wd_walk',      english: 'walk',      phonetic: '[wɔːk]',       chinese: '走, 步行',               stage: 'primary', difficulty: 1 , exampleSentence: "It’s a long walk. Maybe we should get the bus. 走着去很远，或许我们应该乘公共汽车。" , mnemonic: "同根：walker" },
  { id: 'wd_jump',      english: 'jump',      phonetic: '[dʒʌmp]',      chinese: '跳, 跳跃',               stage: 'primary', difficulty: 1 , exampleSentence: "the best jump of the competition 这次比赛中的最佳一跳" , mnemonic: "同根：jumpy / jumping" },
  { id: 'wd_sit',       english: 'sit',       phonetic: '[sɪt]',        chinese: '坐',                     stage: 'primary', difficulty: 1 , exampleSentence: "The parliament building sits in a large square. 议会大楼位于一个大广场上。" , mnemonic: "同根：situate / sitting" },
  { id: 'wd_stand',     english: 'stand',     phonetic: '[stænd]',      chinese: '站, 站立',               stage: 'primary', difficulty: 2 , exampleSentence: "It looks like we’ll have to stand – there are no seats left. 看来我们只能站着——没有座位了。" , mnemonic: "同根：standing / stance" },
  { id: 'wd_sleep',     english: 'sleep',     phonetic: '[sliːp]',      chinese: '睡觉',                   stage: 'primary', difficulty: 1 , exampleSentence: "I usually sleep on my back. 我一般仰卧着睡觉。" , mnemonic: "同根：sleepy / sleeping" },
  { id: 'wd_wake',      english: 'wake',      phonetic: '[weɪk]',       chinese: '醒来; 唤醒',             stage: 'primary', difficulty: 2 , exampleSentence: "Try not to wake the baby. 尽量不要吵醒宝宝。" , mnemonic: "同根：waking / wakeful" },
  { id: 'wd_eat',       english: 'eat',       phonetic: '[iːt]',        chinese: '吃',                     stage: 'primary', difficulty: 1 , exampleSentence: "A small girl was eating an ice cream. 一个小女孩在吃冰激凌。" , mnemonic: "同根：eating / eatable" },
  { id: 'wd_drink',     english: 'drink',     phonetic: '[drɪŋk]',      chinese: '喝; 饮料',               stage: 'primary', difficulty: 1 , exampleSentence: "You should drink plenty of water. 你应该大量喝水。" , mnemonic: "同根：drunk / drinkable" },
  { id: 'wd_play',      english: 'play',      phonetic: '[pleɪ]',       chinese: '玩; 演奏; 打球',         stage: 'primary', difficulty: 1 , exampleSentence: "He’s learning to play the piano. 他在学习弹钢琴。" , mnemonic: "同根：playful / playable" },
  { id: 'wd_read',      english: 'read',      phonetic: '[riːd]',       chinese: '读, 阅读',               stage: 'primary', difficulty: 1 , exampleSentence: "I can’t read your writing. 我看不懂你写的东西。" , mnemonic: "同根：reading / readable" },
  { id: 'wd_write',     english: 'write',     phonetic: '[raɪt]',       chinese: '写',                     stage: 'primary', difficulty: 1 , exampleSentence: "I wrote her several letters , but she didn’t reply. 我给她写了几封信，可是她没有回复。" , mnemonic: "同根：written / writing" },
  { id: 'wd_draw',      english: 'draw',      phonetic: '[drɔː]',       chinese: '画; 绘画',               stage: 'primary', difficulty: 2 , exampleSentence: "Katie had drawn a cottage with a little stream running next to it. 凯蒂画了一间小茅舍，旁边流淌着一条小溪。" , mnemonic: "同根：drawn / drawing" },
  { id: 'wd_sing',      english: 'sing',      phonetic: '[sɪŋ]',        chinese: '唱, 唱歌',               stage: 'primary', difficulty: 1 , exampleSentence: "She can sing beautifully. 她唱歌很好听。" , mnemonic: "同根：singing / singable" },
  { id: 'wd_dance',     english: 'dance',     phonetic: '[dɑːns]',      chinese: '跳舞; 舞蹈',             stage: 'primary', difficulty: 2 , exampleSentence: "The waltz is an easy dance to learn. 华尔兹这种舞很容易学。" , mnemonic: "同根：danceable / dancer" },
  { id: 'wd_swim',      english: 'swim',      phonetic: '[swɪm]',       chinese: '游泳',                   stage: 'primary', difficulty: 2 , exampleSentence: "Let’s go swimming this afternoon. 今天下午我们游泳去吧。" , mnemonic: "同根：swimming / swimmer" },
  { id: 'wd_look',      english: 'look',      phonetic: '[lʊk]',        chinese: '看; 看起来',             stage: 'primary', difficulty: 1 , exampleSentence: "We sneaked out while Jessie’s mom wasn’t looking. 我们趁杰茜的妈妈没有看到，偷偷地溜了出去。" , mnemonic: "同根：looking / looker" },
  { id: 'wd_see',       english: 'see',       phonetic: '[siː]',        chinese: '看见; 理解',             stage: 'primary', difficulty: 1 , exampleSentence: "He crouched down so he couldn’t be seen. 他蹲下来好让别人看不见他。" , mnemonic: "同根：seeing / seeable" },
  { id: 'wd_watch',     english: 'watch',     phonetic: '[wɒtʃ]',       chinese: '看, 观看; 手表',         stage: 'primary', difficulty: 2 , exampleSentence: "Do you mind if I watch? 你介意我看着吗？" , mnemonic: "同根：watchful / watchfully" },
  { id: 'wd_listen',    english: 'listen',    phonetic: '[ˈlɪsn]',      chinese: '听, 倾听',               stage: 'primary', difficulty: 2 , exampleSentence: "Listen! There’s a strange noise in the engine. 听！引擎发出奇怪的声音。" , mnemonic: "同根：listening / listener" },
  { id: 'wd_hear',      english: 'hear',      phonetic: '[hɪə(r)]',     chinese: '听见',                   stage: 'primary', difficulty: 2 , exampleSentence: "Blanche heard a crash as the back door was flung open. 布兰奇听见后门哗啦一声被推开。" , mnemonic: "同根：hearable / hearing" },
  { id: 'wd_say',       english: 'say',       phonetic: '[seɪ]',        chinese: '说',                     stage: 'primary', difficulty: 1 , exampleSentence: "Don’t believe anything he says. 他说什么都不要相信。" , mnemonic: "同根：said / saying" },
  { id: 'wd_talk',      english: 'talk',      phonetic: '[tɔːk]',       chinese: '说, 谈话',               stage: 'primary', difficulty: 1 , exampleSentence: "I could hear Sarah and Andy talking in the next room. 我听到萨拉和安迪在隔壁讲话。" , mnemonic: "同根：talking / talker" },
  { id: 'wd_open',      english: 'open',      phonetic: '[ˈəʊpən]',     chinese: '打开; 开',               stage: 'primary', difficulty: 2 , exampleSentence: "He threw the door open and ran down the stairs. 他猛地打开门，往楼下跑去。" , mnemonic: "同根：opening / openness" },
  { id: 'wd_close',     english: 'close',     phonetic: '[kləʊz]',      chinese: '关, 关闭',               stage: 'primary', difficulty: 2 , exampleSentence: "If you need to buy bread or milk, the closest shop is about a mile away. 如果你需要买面包或牛奶，最近的商店大概有一英里远。" , mnemonic: "同根：closed / closer" },
  { id: 'wd_have',      english: 'have',      phonetic: '[hæv]',        chinese: '有; 吃; 喝',             stage: 'primary', difficulty: 1 , exampleSentence: "Our guests have arrived. 我们的客人到了。" , mnemonic: "同根：having" },
  { id: 'wd_do',        english: 'do',        phonetic: '[duː]',        chinese: '做',                     stage: 'primary', difficulty: 1 },
  { id: 'wd_make',      english: 'make',      phonetic: '[meɪk]',       chinese: '做, 制作',               stage: 'primary', difficulty: 1 , exampleSentence: "I’m going to show you how to make a box for your tools. 我来教你怎么做一个箱子存放工具。" , mnemonic: "同根：made / makable" },
  { id: 'wd_give',      english: 'give',      phonetic: '[ɡɪv]',        chinese: '给',                     stage: 'primary', difficulty: 1 , exampleSentence: "Researchers were given a £10,000 grant to continue their work. 研究人员得到一万英镑的经费以继续他们的研究。" , mnemonic: "同根：given / giving" },
  { id: 'wd_take',      english: 'take',      phonetic: '[teɪk]',       chinese: '拿, 取; 乘坐',           stage: 'primary', difficulty: 1 , exampleSentence: "When he refused to give his name, he was taken into custody. 他拒绝说出自己的名字，于是就被拘留了。" , mnemonic: "同根：taking / taker" },
  { id: 'wd_come_2',    english: 'bring',     phonetic: '[brɪŋ]',       chinese: '带来, 拿来',             stage: 'primary', difficulty: 2 , exampleSentence: "The discovery of gold brought thousands of people to the Transvaal. 黄金的发现把成千上万的人引到了德兰士瓦。" },
  { id: 'wd_help',      english: 'help',      phonetic: '[help]',       chinese: '帮助',                   stage: 'primary', difficulty: 1 , exampleSentence: "If there’s anything I can do to help, just give me a call. 如果需要我帮忙，就给我打个电话。" , mnemonic: "同根：helpful / helpless" },
  { id: 'wd_like',      english: 'like',      phonetic: '[laɪk]',       chinese: '喜欢',                   stage: 'primary', difficulty: 1 , exampleSentence: "I like your jacket. 我喜欢你这件上衣。" , mnemonic: "同根：likely / likable" },
  { id: 'wd_want',      english: 'want',      phonetic: '[wɒnt]',       chinese: '想要',                   stage: 'primary', difficulty: 1 , exampleSentence: "I really want a drink. 我很想喝一杯。" , mnemonic: "同根：wanted / wanting" },
  { id: 'wd_need',      english: 'need',      phonetic: '[niːd]',       chinese: '需要',                   stage: 'primary', difficulty: 2 , exampleSentence: "She works to provide for her family’s basic needs. 她工作是为了维持家里的基本生计。" , mnemonic: "同根：needed / needless" },
  { id: 'wd_know',      english: 'know',      phonetic: '[nəʊ]',        chinese: '知道; 认识',             stage: 'primary', difficulty: 1 , exampleSentence: "Who knows the answer? 谁知道答案？" , mnemonic: "同根：known / knowing" },
  { id: 'wd_think',     english: 'think',     phonetic: '[θɪŋk]',       chinese: '想; 认为',               stage: 'primary', difficulty: 2 , exampleSentence: "He didn’t think anyone would believe him. 他觉得没人会相信他。" , mnemonic: "同根：thoughtful / thinking" },
  { id: 'wd_love',      english: 'love',      phonetic: '[lʌv]',        chinese: '爱; 喜爱',               stage: 'primary', difficulty: 1 , exampleSentence: "Tara is madly in love with you. 塔拉疯狂地爱着你。" , mnemonic: "同根：lovely / loving" },
  { id: 'wd_work',      english: 'work',      phonetic: '[wɜːk]',       chinese: '工作',                   stage: 'primary', difficulty: 2 , exampleSentence: "There isn’t a lot of work at this time of the year. 每年这个时候工作机会都不多。" , mnemonic: "同根：wrought / workaholic" },
  { id: 'wd_study',     english: 'study',     phonetic: '[ˈstʌdi]',     chinese: '学习; 研究',             stage: 'primary', difficulty: 2 , exampleSentence: "The study was carried out between January and May 2008. 这项研究是在 2008 年1月到5月间进行的。" , mnemonic: "同根：stud / studied" },
  { id: 'wd_learn',     english: 'learn',     phonetic: '[lɜːn]',       chinese: '学习, 学到',             stage: 'primary', difficulty: 2 , exampleSentence: "What’s the best way to learn a language? 学习语言的最佳方法是什么？" , mnemonic: "同根：learned / learnedly" },
  { id: 'wd_teach',     english: 'teach',     phonetic: '[tiːtʃ]',      chinese: '教, 教学',               stage: 'primary', difficulty: 2 , exampleSentence: "She taught me fractions and counting. 他教我分数和计算。" , mnemonic: "同根：teachable / teacher" },
  { id: 'wd_tell',      english: 'tell',      phonetic: '[tel]',        chinese: '告诉, 讲述',             stage: 'primary', difficulty: 2 , exampleSentence: "I’ll tell you all about it when I get back. 我回来再告诉你这一切。" , mnemonic: "同根：telling / teller" },
  { id: 'wd_ask',       english: 'ask',       phonetic: '[ɑːsk]',       chinese: '问, 询问',               stage: 'primary', difficulty: 1 , exampleSentence: "‘What’s your name?’ she asked. “你叫什么名字？”她问道 。" , mnemonic: "同根：asking / asker" },
  { id: 'wd_answer',    english: 'answer',    phonetic: '[ˈɑːnsə(r)]',  chinese: '回答; 答复',             stage: 'primary', difficulty: 2 , exampleSentence: "She thought for a moment before answering. 她想了一会儿才回答。" , mnemonic: "同根：answerable / answerer" },
  { id: 'wd_find',      english: 'find',      phonetic: '[faɪnd]',      chinese: '找到, 发现',             stage: 'primary', difficulty: 1 , exampleSentence: "I can’t find the car keys. 我找不到汽车钥匙。" , mnemonic: "同根：finding / finder" },
  { id: 'wd_put',       english: 'put',       phonetic: '[pʊt]',        chinese: '放, 放置',               stage: 'primary', difficulty: 1 , exampleSentence: "He put the coffee on the table. 他把咖啡放在桌上。" , mnemonic: "同根：putting / putter" },
  { id: 'wd_get',       english: 'get',       phonetic: '[ɡet]',        chinese: '得到; 到达',             stage: 'primary', difficulty: 1 , exampleSentence: "We need to get help quickly! 我们需要马上得到帮助！" , mnemonic: "同根：getable / getatable" },
  { id: 'wd_let',       english: 'let',       phonetic: '[let]',        chinese: '让',                     stage: 'primary', difficulty: 2 , exampleSentence: "I can’t come out tonight – my dad won’t let me. 今天晚上我不能出来，我爸爸不允许。" , mnemonic: "同根：letting" },
  { id: 'wd_use',       english: 'use',       phonetic: '[juːz]',       chinese: '使用',                   stage: 'primary', difficulty: 1 , exampleSentence: "an exit for use in emergencies 紧急出口" , mnemonic: "同根：usable / useful" },
  { id: 'wd_show',      english: 'show',      phonetic: '[ʃəʊ]',       chinese: '展示, 给...看',          stage: 'primary', difficulty: 2 , exampleSentence: "The man grinned, showing bad teeth. 那男人咧着嘴笑，露出一口坏牙。" , mnemonic: "同根：showy / showily" },
  { id: 'wd_clean',     english: 'clean',     phonetic: '[kliːn]',      chinese: '打扫; 干净的',           stage: 'primary', difficulty: 2 , exampleSentence: "Are your hands clean? 你的手干净吗？" , mnemonic: "同根：cleanly / cleanable" },
  { id: 'wd_wash',      english: 'wash',      phonetic: '[wɒʃ]',        chinese: '洗, 洗涤',               stage: 'primary', difficulty: 2 , exampleSentence: "Those jeans need a good wash (= a thorough wash ). 那条牛仔裤要好好洗一洗了。" , mnemonic: "同根：washing / washable" },
  { id: 'wd_cook',      english: 'cook',      phonetic: '[kʊk]',        chinese: '做饭; 厨师',             stage: 'primary', difficulty: 2 , exampleSentence: "Where did you learn to cook? 你在哪里学烹调的？" , mnemonic: "同根：cooking / cooker" },
  { id: 'wd_buy',       english: 'buy',       phonetic: '[baɪ]',        chinese: '买, 购买',               stage: 'primary', difficulty: 1 , exampleSentence: "People say the judge had been bought by the Mafia. 人们都说法官被黑手党收买了。" , mnemonic: "同根：buyable / buyer" },
  { id: 'wd_sell',      english: 'sell',      phonetic: '[sel]',        chinese: '卖, 出售',               stage: 'primary', difficulty: 2 , exampleSentence: "If you offer him another hundred, I think he’ll sell. 如果你再加一百元钱，我想他会卖的。" , mnemonic: "同根：sellable / seller" },
  { id: 'wd_meet',      english: 'meet',      phonetic: '[miːt]',       chinese: '遇见, 见面',             stage: 'primary', difficulty: 2 , exampleSentence: "I was worried I might meet Henry on the bus. 我担心可能会在公共汽车上遇到亨利。" , mnemonic: "同根：meeting" },
  { id: 'wd_visit',     english: 'visit',     phonetic: '[ˈvɪzɪt]',     chinese: '拜访, 参观',             stage: 'primary', difficulty: 3 , exampleSentence: "We’re just here on a short visit. 我们只在这儿作短暂逗留。" , mnemonic: "同根：visitant / visitor" },
  { id: 'wd_phone',     english: 'phone',     phonetic: '[fəʊn]',       chinese: '电话; 打电话',           stage: 'primary', difficulty: 2 , exampleSentence: "Much of his work is done by phone . 他的工作大部分是通过电话进行的。" },
  { id: 'wd_call',      english: 'call',      phonetic: '[kɔːl]',       chinese: '喊; 打电话',             stage: 'primary', difficulty: 2 , exampleSentence: "I heard someone calling in the distance. 我听到远处有人在叫。" , mnemonic: "同根：caller / callable" },
  { id: 'wd_drive',     english: 'drive',     phonetic: '[draɪv]',      chinese: '驾驶, 开车',             stage: 'primary', difficulty: 3 , exampleSentence: "Can you drive? 你会开车吗？" , mnemonic: "同根：driven / driving" },
  { id: 'wd_fly',       english: 'fly',       phonetic: '[flaɪ]',        chinese: '飞, 飞行',               stage: 'primary', difficulty: 2 , exampleSentence: "She’s flying back to the States tomorrow. 她明天乘飞机回美国。" , mnemonic: "同根：flying / flyaway" },
  { id: 'wd_send',      english: 'send',      phonetic: '[send]',       chinese: '寄, 发送',               stage: 'primary', difficulty: 2 , exampleSentence: "Lyn sent some pictures of the wedding. 琳恩寄了几张婚礼照片。" , mnemonic: "同根：sender / sending" },
  { id: 'wd_forget',    english: 'forget',    phonetic: '[fəˈɡet]',     chinese: '忘记',                   stage: 'primary', difficulty: 3 , exampleSentence: "He’s someone who never forgets a face (= forgets who someone is ) . 他是那种见人一面就不会忘记的人。" , mnemonic: "同根：forgetful / forgettable" },
  { id: 'wd_try',       english: 'try',       phonetic: '[traɪ]',       chinese: '试, 尝试',               stage: 'primary', difficulty: 1 , exampleSentence: "Let’s have a rest and then we’ll try again. 我们休息一下，然后再试。" , mnemonic: "同根：trial / tried" },

  // ============================================================
  // 18. 形容词
  // ============================================================
  { id: 'wd_big',       english: 'big',       phonetic: '[bɪɡ]',        chinese: '大的',                   stage: 'primary', difficulty: 1 , exampleSentence: "a big house 大房子" , mnemonic: "同根：bigger / bigness" },
  { id: 'wd_small',     english: 'small',     phonetic: '[smɔːl]',      chinese: '小的',                   stage: 'primary', difficulty: 1 , exampleSentence: "a small piece of paper 一小片纸" , mnemonic: "同根：smallish / smallness" },
  { id: 'wd_long',      english: 'long',      phonetic: '[lɒŋ]',        chinese: '长的',                   stage: 'primary', difficulty: 1 , exampleSentence: "a long table 一张长桌子" , mnemonic: "同根：lengthy / longing" },
  { id: 'wd_short',     english: 'short',     phonetic: '[ʃɔːt]',       chinese: '短的; 矮的',             stage: 'primary', difficulty: 1 , exampleSentence: "a short meeting 一个短会" , mnemonic: "同根：shortish / shortly" },
  { id: 'wd_tall',      english: 'tall',      phonetic: '[tɔːl]',       chinese: '高的, 高的(身材)',       stage: 'primary', difficulty: 2 , exampleSentence: "He was young and tall. 他年轻，身材高大。" , mnemonic: "同根：tallish / tally" },
  { id: 'wd_high',      english: 'high',      phonetic: '[haɪ]',        chinese: '高的',                   stage: 'primary', difficulty: 1 , exampleSentence: "This is the highest mountain in Japan. 这是日本最高的山。" , mnemonic: "同根：higher / highly" },
  { id: 'wd_low',       english: 'low',       phonetic: '[ləʊ]',        chinese: '低的',                   stage: 'primary', difficulty: 2 , exampleSentence: "Their safety standards seem to be pretty low. 他们的安全标准似乎相当低。" , mnemonic: "同根：lowly / lowliness" },
  { id: 'wd_fast',      english: 'fast',      phonetic: '[fɑːst]',      chinese: '快的, 迅速的',           stage: 'primary', difficulty: 1 , exampleSentence: "a fast car 速度很快的汽车" , mnemonic: "同根：fasting / fastness" },
  { id: 'wd_slow',      english: 'slow',      phonetic: '[sləʊ]',       chinese: '慢的',                   stage: 'primary', difficulty: 2 , exampleSentence: "The car was travelling at a very slow speed. 汽车正以非常慢的速度行驶。" , mnemonic: "同根：slower / slowly" },
  { id: 'wd_new',       english: 'new',       phonetic: '[njuː]',       chinese: '新的',                   stage: 'primary', difficulty: 1 , exampleSentence: "the city’s new hospital 市里新建的医院" , mnemonic: "同根：newish / newly" },
  { id: 'wd_old',       english: 'old',       phonetic: '[əʊld]',       chinese: '旧的; 年老的',           stage: 'primary', difficulty: 1 , exampleSentence: "a pair of old shoes 一双旧鞋" , mnemonic: "同根：olden / oldish" },
  { id: 'wd_good',      english: 'good',      phonetic: '[ɡʊd]',        chinese: '好的',                   stage: 'primary', difficulty: 1 , exampleSentence: "a good hotel 一家不错的宾馆" , mnemonic: "同根：goody / goodly" },
  { id: 'wd_bad',       english: 'bad',       phonetic: '[bæd]',        chinese: '坏的; 不好的',           stage: 'primary', difficulty: 1 , exampleSentence: "I have some bad news for you. 我有坏消息要告诉你。" , mnemonic: "同根：badly / badness" },
  { id: 'wd_happy',     english: 'happy',     phonetic: '[ˈhæpi]',      chinese: '快乐的; 高兴的',         stage: 'primary', difficulty: 1 , exampleSentence: "It’s a lovely house and we’ve been very happy here. 房子很漂亮，我们住在这里非常开心。" , mnemonic: "同根：happily / happiness" },
  { id: 'wd_sad',       english: 'sad',       phonetic: '[sæd]',        chinese: '悲伤的; 难过的',         stage: 'primary', difficulty: 1 , exampleSentence: "Sorry to hear the sad news . 听到这令人伤心的消息我很难过。" , mnemonic: "同根：sadly / sadness" },
  { id: 'wd_funny',     english: 'funny',     phonetic: '[ˈfʌni]',      chinese: '有趣的; 可笑的',         stage: 'primary', difficulty: 2 , exampleSentence: "If this is your idea of a joke, I don’t find it at all funny . 如果你觉得这是个玩笑，那我认为它一点也不好笑。" , mnemonic: "同根：fun / funnily" },
  { id: 'wd_pretty',    english: 'pretty',    phonetic: '[ˈprɪti]',     chinese: '漂亮的; 美丽的',         stage: 'primary', difficulty: 2 , exampleSentence: "a pretty little girl 漂亮的小姑娘" , mnemonic: "同根：prettily / prettiness" },
  { id: 'wd_beautiful', english: 'beautiful', phonetic: '[ˈbjuːtɪfl]',  chinese: '美丽的',                 stage: 'primary', difficulty: 3 , exampleSentence: "She was even more beautiful than I had remembered. 她比我记忆中更美。" , mnemonic: "同根：beauteous / beautifully" },
  { id: 'wd_nice',      english: 'nice',      phonetic: '[naɪs]',       chinese: '好的, 令人愉快的',       stage: 'primary', difficulty: 1 , exampleSentence: "They’ve got a very nice house. 他们的房子真漂亮。" , mnemonic: "同根：nicely / nicety" },
  { id: 'wd_easy',      english: 'easy',      phonetic: '[ˈiːzi]',      chinese: '容易的',                 stage: 'primary', difficulty: 2 , exampleSentence: "The test was easy. 考试很容易。" , mnemonic: "同根：easily / ease" },
  { id: 'wd_hard',      english: 'hard',      phonetic: '[hɑːd]',       chinese: '困难的; 硬的',           stage: 'primary', difficulty: 3 , exampleSentence: "a hard wooden chair 一把硬木椅" , mnemonic: "同根：hardened / hardy" },
  { id: 'wd_young',     english: 'young',     phonetic: '[jʌŋ]',        chinese: '年轻的',                 stage: 'primary', difficulty: 2 , exampleSentence: "a young child 幼儿" , mnemonic: "同根：younger / youthful" },
  { id: 'wd_kind',      english: 'kind',      phonetic: '[kaɪnd]',      chinese: '善良的; 亲切的',         stage: 'primary', difficulty: 3 , exampleSentence: "Get me a sandwich – any kind will do. 给我一份三明治，随便哪种都可以。" , mnemonic: "同根：kindly" },
  { id: 'wd_clever',    english: 'clever',    phonetic: '[ˈklevə(r)]',  chinese: '聪明的',                 stage: 'primary', difficulty: 3 , exampleSentence: "a clever man 聪明的人" , mnemonic: "同根：cleverly / cleverness" },
  { id: 'wd_busy',      english: 'busy',      phonetic: '[ˈbɪzi]',      chinese: '忙的',                   stage: 'primary', difficulty: 2 , exampleSentence: "She’s busy now – can you phone later? 她现在正忙，你稍后打来好吗？" , mnemonic: "同根：busily / bustle" },
  { id: 'wd_ready',     english: 'ready',     phonetic: '[ˈredi]',      chinese: '准备好的',               stage: 'primary', difficulty: 2 , exampleSentence: "Come on. Aren’t you ready yet? 快点，你还没准备好吗？" , mnemonic: "同根：readily / readiness" },
  { id: 'wd_right',     english: 'right',     phonetic: '[raɪt]',       chinese: '正确的; 右边',           stage: 'primary', difficulty: 2 , exampleSentence: "Yes, that’s the right answer . 对，回答正确。" , mnemonic: "同根：righteous / rightful" },
  { id: 'wd_wrong',     english: 'wrong',     phonetic: '[rɒŋ]',        chinese: '错误的',                 stage: 'primary', difficulty: 1 , exampleSentence: "You’ve spelt my name wrong. 你把我的名字拼错了。" , mnemonic: "同根：wrongful / wrongheaded" },
  { id: 'wd_left',      english: 'left',      phonetic: '[left]',       chinese: '左边; 离开',             stage: 'primary', difficulty: 2 , exampleSentence: "She held out her left hand. 她伸出左手。" },
  { id: 'wd_full',      english: 'full',      phonetic: '[fʊl]',        chinese: '满的; 吃饱的',           stage: 'primary', difficulty: 2 , exampleSentence: "The train was completely full. 火车坐得满满的。" , mnemonic: "同根：fully / fullness" },
  { id: 'wd_empty',     english: 'empty',     phonetic: '[ˈempti]',     chinese: '空的',                   stage: 'primary', difficulty: 2 , exampleSentence: "an empty box 空盒子" , mnemonic: "同根：emptiness / emptying" },
  { id: 'wd_open2',     english: 'open',      phonetic: '[ˈəʊpən]',     chinese: '开着的; 开放的',         stage: 'primary', difficulty: 2 , exampleSentence: "He threw the door open and ran down the stairs. 他猛地打开门，往楼下跑去。" , mnemonic: "同根：opening / openness" },
  { id: 'wd_loud',      english: 'loud',      phonetic: '[laʊd]',       chinese: '大声的; 响亮的',         stage: 'primary', difficulty: 2 , exampleSentence: "The book fell to the floor with a loud bang. 书砰的一声掉落到地上。" , mnemonic: "同根：loudly / loudness" },

  // ============================================================
  // 19. 数字相关
  // ============================================================
  { id: 'wd_many',      english: 'many',      phonetic: '[ˈmeni]',      chinese: '许多, 多的',             stage: 'primary', difficulty: 1 , exampleSentence: "The printing press gave power to a few to change the world for the many. 印刷机赋予了少数人为多数人改变世界的力量。" },
  { id: 'wd_much',      english: 'much',      phonetic: '[mʌtʃ]',       chinese: '许多, 大量',             stage: 'primary', difficulty: 1 , exampleSentence: "The day ended much as it began. 这一天结束时还像开始时一样。" , mnemonic: "同根：muchness" },
  { id: 'wd_some',      english: 'some',      phonetic: '[sʌm]',        chinese: '一些, 某些',             stage: 'primary', difficulty: 1 , exampleSentence: "I’ve just made a pot of coffee. Would you like some? 我刚煮了一壶咖啡，你想喝点吗？" , mnemonic: "同根：something / sometime" },
  { id: 'wd_any',       english: 'any',       phonetic: '[ˈeni]',       chinese: '任何; 一些',             stage: 'primary', difficulty: 2 , exampleSentence: "We should be prepared for any contingency. 我们应该对任何应急情况有所准备。" , mnemonic: "同根：ane / anywhere" },
  { id: 'wd_little',    english: 'little',    phonetic: '[ˈlɪtl]',      chinese: '小的; 少的',             stage: 'primary', difficulty: 2 , exampleSentence: "a little house 小屋" , mnemonic: "同根：littleness" },
  { id: 'wd_a_lot',     english: 'a lot',     phonetic: '[ə lɒt]',      chinese: '许多, 大量',             stage: 'primary', difficulty: 2 },
  { id: 'wd_money',     english: 'money',     phonetic: '[ˈmʌni]',      chinese: '钱, 金钱',               stage: 'primary', difficulty: 2 , exampleSentence: "Don’t spend all your money on the first day of your holiday! 别在度假的第一天就把钱都花完了！" , mnemonic: "同根：monetary / monetarist" },
  { id: 'wd_yuan',      english: 'yuan',      phonetic: '[juˈɑːn]',     chinese: '元(人民币)',            stage: 'primary', difficulty: 4 },

  // ============================================================
  // 20. 兴趣 + 运动 + 娱乐
  // ============================================================
  { id: 'wd_song',      english: 'song',      phonetic: '[sɒŋ]',        chinese: '歌, 歌曲',               stage: 'primary', difficulty: 1 , exampleSentence: "the song of the lark 云雀的鸣唱" , mnemonic: "同根：songful / songwriter" },
  { id: 'wd_movie',     english: 'movie',     phonetic: '[ˈmuːvi]',     chinese: '电影',                   stage: 'primary', difficulty: 2 , exampleSentence: "It was like one of those old John Wayne movies. 这部电影有点像约翰•韦恩演的一部老片子。" , mnemonic: "同根：moviegoer" },
  { id: 'wd_game',      english: 'game',      phonetic: '[ɡeɪm]',       chinese: '游戏; 比赛',             stage: 'primary', difficulty: 2 , exampleSentence: "The boys were playing a game in the backyard. 男孩们在后院里玩游戏。" , mnemonic: "同根：gamy / gamey" },
  { id: 'wd_toy',       english: 'toy',       phonetic: '[tɔɪ]',        chinese: '玩具',                   stage: 'primary', difficulty: 2 , exampleSentence: "some toys for the baby 宝宝玩的一些玩具" },
  { id: 'wd_ball_game', english: 'football',  phonetic: '[ˈfʊtbɔːl]',   chinese: '足球; 橄榄球',           stage: 'primary', difficulty: 3 , exampleSentence: "Which football team do you support? 你支持哪个球队？" , mnemonic: "同根：footballer" },
  { id: 'wd_basketball',english: 'basketball',phonetic: '[ˈbɑːskɪtbɔːl]',chinese: '篮球',                  stage: 'primary', difficulty: 4 },
  { id: 'wd_ping_pong', english: 'ping-pong', phonetic: '[ˈpɪŋ pɒŋ]',   chinese: '乒乓球',                 stage: 'primary', difficulty: 4 },
  { id: 'wd_TV',        english: 'TV',        phonetic: '[ˌtiːˈviː]',    chinese: '电视',                   stage: 'primary', difficulty: 2 , exampleSentence: "Drag up a chair and watch the TV. 拖一把椅子坐到前面来看电视。" },
  { id: 'wd_radio',     english: 'radio',     phonetic: '[ˈreɪdɪəʊ]',   chinese: '收音机; 电台',           stage: 'primary', difficulty: 3 , exampleSentence: "The last 12 months have been difficult ones for local radio. 最近的12个月对地方广播电台来说是艰难的。" },
  { id: 'wd_computer',  english: 'computer',  phonetic: '[kəmˈpjuːtə(r)]',chinese: '计算机, 电脑',         stage: 'primary', difficulty: 3 , exampleSentence: "a huge global computer network 巨大的全球计算机网络" , mnemonic: "同根：computational / computerized" },
  { id: 'wd_phone2',    english: 'mobile',    phonetic: '[ˈməʊbaɪl]',   chinese: '手机',                   stage: 'primary', difficulty: 3 , exampleSentence: "mobile air-conditioners 移动式空调器" , mnemonic: "同根：mobility / mobilization" },

  // ============================================================
  // 21. 物品 + 工具
  // ============================================================
  { id: 'wd_book2',     english: 'storybook', phonetic: '[ˈstɔːribʊk]', chinese: '故事书',                 stage: 'primary', difficulty: 3 },
  { id: 'wd_letter',    english: 'letter',    phonetic: '[ˈletə(r)]',   chinese: '字母; 信',               stage: 'primary', difficulty: 2 , exampleSentence: "There are 26 letters in the English alphabet. 英语字母表有26个字母。" , mnemonic: "同根：lettered / letterpress" },
  { id: 'wd_word',      english: 'word',      phonetic: '[wɜːd]',       chinese: '单词; 字',               stage: 'primary', difficulty: 1 , exampleSentence: "Write an essay of about five hundred words. 写一篇约500字的文章。" , mnemonic: "同根：wordless / wording" },
  { id: 'wd_name',      english: 'name',      phonetic: '[neɪm]',       chinese: '名字; 名称',             stage: 'primary', difficulty: 1 , exampleSentence: "Her name is Mandy Wilson. 她的名字是曼迪•威尔逊。" , mnemonic: "同根：named / nameless" },
  { id: 'wd_number',    english: 'number',    phonetic: '[ˈnʌmbə(r)]',  chinese: '数字; 号码',             stage: 'primary', difficulty: 1 , exampleSentence: "They wrote various numbers on a large sheet of paper. 他们在一张大纸上写下了很多不同的数字。" , mnemonic: "同根：numeral / numberless" },
  { id: 'wd_question',  english: 'question',  phonetic: '[ˈkwestʃən]',  chinese: '问题',                   stage: 'primary', difficulty: 2 , exampleSentence: "Can I ask you a question? 我能问你个问题吗？" , mnemonic: "同根：questionable / questionably" },
  { id: 'wd_key',       english: 'key',       phonetic: '[kiː]',        chinese: '钥匙; 关键',             stage: 'primary', difficulty: 2 , exampleSentence: "A bunch of keys hung from his belt. 他的皮带上挂着一串钥匙。" , mnemonic: "同根：keyless / keyboard" },
  { id: 'wd_clock',     english: 'clock',     phonetic: '[klɒk]',       chinese: '钟; 时钟',               stage: 'primary', difficulty: 1 , exampleSentence: "I heard the clock strike six (= make six loud sounds ) . 我听到钟敲了六下。" , mnemonic: "同根：clockwise / clocking" },
  { id: 'wd_bed',       english: 'bed',       phonetic: '[bed]',        chinese: '床',                     stage: 'primary', difficulty: 1 , exampleSentence: "You should go to bed early. 你应该早点上床。" , mnemonic: "同根：bedding / bedded" },
  { id: 'wd_lamp',      english: 'lamp',      phonetic: '[læmp]',       chinese: '灯',                     stage: 'primary', difficulty: 2 , exampleSentence: "She switched on the bedside lamp. 她打开了床头灯。" },
  { id: 'wd_mirror',    english: 'mirror',    phonetic: '[ˈmɪrə(r)]',   chinese: '镜子',                   stage: 'primary', difficulty: 3 , exampleSentence: "He spends hours in front of the mirror ! 他老是照镜子！" , mnemonic: "同根：mirrored / mirrorlike" },
  { id: 'wd_radio2',    english: 'phone',     phonetic: '[fəʊn]',       chinese: '电话',                   stage: 'primary', difficulty: 2 , exampleSentence: "Much of his work is done by phone . 他的工作大部分是通过电话进行的。" },
  { id: 'wd_camera',    english: 'camera',    phonetic: '[ˈkæmərə]',    chinese: '照相机; 摄影机',         stage: 'primary', difficulty: 3 , exampleSentence: "Her grandmother lent her a camera for a school trip to Venice and Egypt. 她的祖母借给她一部相机，让她在学校组织的到威尼斯和埃及的旅行中使用。" },

  // ============================================================
  // 22. 节日 + 时间概念
  // ============================================================
  { id: 'wd_birthday',  english: 'birthday',  phonetic: '[ˈbɜːθdeɪ]',   chinese: '生日',                   stage: 'primary', difficulty: 2 , exampleSentence: "It’s my birthday on Monday. 星期一是我的生日。" },
  { id: 'wd_present',   english: 'present',   phonetic: '[ˈpreznt]',    chinese: '礼物; 现在的',           stage: 'primary', difficulty: 3 , exampleSentence: "She was presented with an award . 她被授予一个奖项。" , mnemonic: "同根：presentable / presentational" },
  { id: 'wd_party',     english: 'party',     phonetic: '[ˈpɑːti]',     chinese: '派对; 聚会',             stage: 'primary', difficulty: 3 , exampleSentence: "We’re having a small party this evening to celebrate our wedding anniversary. 我们今晚有个小聚会，庆祝我们的结婚纪念日。" , mnemonic: "同根：partygoer" },
  { id: 'wd_Christmas', english: 'Christmas', phonetic: '[ˈkrɪsməs]',   chinese: '圣诞节',                 stage: 'primary', difficulty: 4 , exampleSentence: "Are you going home for Christmas? 你回家过圣诞节吗？" },
  { id: 'wd_Spring_Festival',english:'Spring Festival',phonetic:'[sprɪŋ ˈfɛstɪvəl]',chinese:'春节',stage:'primary',difficulty:5 },
];
