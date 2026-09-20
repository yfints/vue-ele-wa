/**
 * 音标详情页的卡片数据（按设计稿整理）。
 *
 * 目前后端没有音标内容的接口（C 端只有 /courses?type=3 的音标课程），
 * 所以 48 个音标里先落设计稿画到的 20 个元音：分组、发音要点、例句、示例单词。
 * 接口就绪后把 `phoneticGroups` 换成接口数据即可，页面结构不用动。
 */

export interface PhoneticWord {
  /** 例词 */
  word: string;
  /** 中文释义 */
  zh: string;
  /** 该词自己的发音音频（接口下发时优先用它，没有就走有道 TTS） */
  audio?: string;
}

export interface PhoneticSentence {
  en: string;
  zh: string;
}

export interface PhoneticItem {
  /** 音标，例如 /i:/ */
  ipa: string;
  /** 该音标的发音音频（接口下发时优先用它，没有就走有道 TTS） */
  audio?: string;
  /** 卡片右上角的类型说明，例如「前元音 · 长元音」 */
  type: string;
  /** 发音要点，最多 3 条 */
  tips: string[];
  /** 例句，设计稿里一行两个 */
  sentences: PhoneticSentence[];
  /** 示例单词，设计稿里一行三个 */
  words: PhoneticWord[];
}

export interface PhoneticGroup {
  /** 分组名，例如「前元音」 */
  name: string;
  /** 分组圆点颜色，取自设计稿 */
  tone: string;
  items: PhoneticItem[];
}

const FRONT_TONE = "#00C26D";
const CENTER_TONE = "#1667EB";
const BACK_TONE = "#FFA726";
const DIPHTHONG_TONE = "#7C4DFF";

export const phoneticGroups: PhoneticGroup[] = [
  {
    name: "前元音",
    tone: FRONT_TONE,
    items: [
      {
        ipa: "/i:/",
        type: "前元音 · 长元音",
        tips: ["舌尖抵下齿，舌前部抬高", "嘴角向两旁微微展开", "声音拉长，声带振动"],
        sentences: [
          { en: "I can see a big tree.", zh: "我能看到一棵大树。" },
          { en: "These three sheep are sleeping.", zh: "这三只羊正在睡觉。" },
        ],
        words: [
          { word: "See", zh: "看见" },
          { word: "Tea", zh: "茶叶" },
          { word: "Tree", zh: "树" },
        ],
      },
      {
        ipa: "/ɪ/",
        type: "前元音 · 短元音",
        tips: ["舌前部稍抬起，比 /i:/ 低", "嘴角放松，开口略大", "发音短促，不要拖长"],
        sentences: [
          { en: "This ship is very big.", zh: "这艘船很大。" },
          { en: "Give him a little milk.", zh: "给他一点牛奶。" },
        ],
        words: [
          { word: "Ship", zh: "船" },
          { word: "Big", zh: "大的" },
          { word: "Milk", zh: "牛奶" },
        ],
      },
      {
        ipa: "/e/",
        type: "前元音 · 短元音",
        tips: ["舌尖抵下齿，舌前部抬起", "上下齿之间约一个小指尖", "短促有力，不拖音"],
        sentences: [
          { en: "Let us go to bed.", zh: "我们去睡觉吧。" },
          { en: "Ten eggs are in the box.", zh: "盒子里有十个鸡蛋。" },
        ],
        words: [
          { word: "Bed", zh: "床" },
          { word: "Egg", zh: "鸡蛋" },
          { word: "Ten", zh: "十" },
        ],
      },
      {
        ipa: "/æ/",
        type: "前元音 · 短元音",
        tips: ["嘴巴张大，上下齿间约两指宽", "舌前部放低，舌尖抵下齿", "声音短促，嘴角向两旁拉"],
        sentences: [
          { en: "The cat sat on the mat.", zh: "猫坐在垫子上。" },
          { en: "That man has a black hat.", zh: "那个男人有一顶黑帽子。" },
        ],
        words: [
          { word: "Cat", zh: "猫" },
          { word: "Hat", zh: "帽子" },
          { word: "Apple", zh: "苹果" },
        ],
      },
    ],
  },
  {
    name: "中元音",
    tone: CENTER_TONE,
    items: [
      {
        ipa: "/ɜ:/",
        type: "中元音 · 长元音",
        tips: ["舌身平放，舌中部抬起", "双唇自然放松，微微外展", "声音拉长，喉部不要用力"],
        sentences: [
          { en: "The girl is the first to work.", zh: "这个女孩第一个开始工作。" },
          { en: "Her bird likes worms.", zh: "她的鸟喜欢吃虫子。" },
        ],
        words: [
          { word: "Girl", zh: "女孩" },
          { word: "Bird", zh: "鸟" },
          { word: "Work", zh: "工作" },
        ],
      },
      {
        ipa: "/ə/",
        type: "中元音 · 短元音",
        tips: ["口腔完全放松，舌身平放", "双唇自然，不圆不扁", "轻而短，多出现在非重读音节"],
        sentences: [
          { en: "My sister is a teacher.", zh: "我姐姐是一名老师。" },
          { en: "Please give me a banana.", zh: "请给我一根香蕉。" },
        ],
        words: [
          { word: "Teacher", zh: "老师" },
          { word: "Banana", zh: "香蕉" },
          { word: "About", zh: "关于" },
        ],
      },
      {
        ipa: "/ʌ/",
        type: "中元音 · 短元音",
        tips: ["舌中部稍抬起，舌尖轻抵下齿", "嘴巴半开，双唇自然", "短促有力，像被轻轻弹开"],
        sentences: [
          { en: "My brother loves the sun.", zh: "我弟弟喜欢阳光。" },
          { en: "Come and have some lunch.", zh: "过来吃点午饭吧。" },
        ],
        words: [
          { word: "Sun", zh: "太阳" },
          { word: "Cup", zh: "杯子" },
          { word: "Lunch", zh: "午餐" },
        ],
      },
    ],
  },
  {
    name: "后元音",
    tone: BACK_TONE,
    items: [
      {
        ipa: "/ɑ:/",
        type: "后元音 · 长元音",
        tips: ["嘴巴张大，舌身后缩", "舌位低，舌尖离开下齿", "声音拉长，喉部放松"],
        sentences: [
          { en: "My father drives a car.", zh: "我爸爸开车。" },
          { en: "The park is far from here.", zh: "公园离这里很远。" },
        ],
        words: [
          { word: "Car", zh: "汽车" },
          { word: "Park", zh: "公园" },
          { word: "Star", zh: "星星" },
        ],
      },
      {
        ipa: "/ɒ/",
        type: "后元音 · 短元音",
        tips: ["嘴巴略开，双唇稍圆", "舌身后缩，舌位低", "发音短促，不要拖长"],
        sentences: [
          { en: "The dog is in the box.", zh: "狗在盒子里。" },
          { en: "Let us stop at the shop.", zh: "我们在商店停一下吧。" },
        ],
        words: [
          { word: "Dog", zh: "狗" },
          { word: "Box", zh: "盒子" },
          { word: "Shop", zh: "商店" },
        ],
      },
      {
        ipa: "/ɔ:/",
        type: "后元音 · 长元音",
        tips: ["双唇收圆并向前突出", "舌身后缩，舌位半低", "声音拉长，圆唇保持稳定"],
        sentences: [
          { en: "I saw a horse at the door.", zh: "我在门口看见一匹马。" },
          { en: "She bought a short fork.", zh: "她买了一把短叉子。" },
        ],
        words: [
          { word: "Door", zh: "门" },
          { word: "Horse", zh: "马" },
          { word: "Fork", zh: "叉子" },
        ],
      },
      {
        ipa: "/ʊ/",
        type: "后元音 · 短元音",
        tips: ["双唇收圆，但比 /u:/ 放松", "舌身后缩，舌位稍高", "发音短促，嘴唇不要用力"],
        sentences: [
          { en: "The cook looks at the book.", zh: "厨师看着这本书。" },
          { en: "Put your foot on the wood.", zh: "把你的脚放在木头上。" },
        ],
        words: [
          { word: "Book", zh: "书" },
          { word: "Cook", zh: "厨师" },
          { word: "Foot", zh: "脚" },
        ],
      },
      {
        ipa: "/u:/",
        type: "后元音 · 长元音",
        tips: ["双唇收得很圆，向前突出", "舌身后缩，舌位高", "声音拉长，圆唇保持不动"],
        sentences: [
          { en: "The moon is very beautiful.", zh: "月亮非常美丽。" },
          { en: "My new shoes are blue.", zh: "我的新鞋子是蓝色的。" },
        ],
        words: [
          { word: "Moon", zh: "月亮" },
          { word: "Blue", zh: "蓝色的" },
          { word: "Shoe", zh: "鞋子" },
        ],
      },
    ],
  },
  {
    name: "双元音",
    tone: DIPHTHONG_TONE,
    items: [
      {
        ipa: "/eɪ/",
        type: "双元音 · 合口双元音",
        tips: ["从 /e/ 滑向 /ɪ/", "前重后轻，前长后短", "口型由半开收小"],
        sentences: [
          { en: "They play games every day.", zh: "他们每天玩游戏。" },
          { en: "Wait for me at the gate.", zh: "在门口等我。" },
        ],
        words: [
          { word: "Day", zh: "白天" },
          { word: "Name", zh: "名字" },
          { word: "Rain", zh: "雨" },
        ],
      },
      {
        ipa: "/aɪ/",
        type: "双元音 · 合口双元音",
        tips: ["从 /a/ 滑向 /ɪ/", "口型由大变小", "前重后轻，尾音短促"],
        sentences: [
          { en: "I like the blue sky.", zh: "我喜欢蓝色的天空。" },
          { en: "My bike is very nice.", zh: "我的自行车很棒。" },
        ],
        words: [
          { word: "Sky", zh: "天空" },
          { word: "Bike", zh: "自行车" },
          { word: "Time", zh: "时间" },
        ],
      },
      {
        ipa: "/ɔɪ/",
        type: "双元音 · 合口双元音",
        tips: ["从 /ɔ/ 滑向 /ɪ/", "双唇先圆后扁", "前重后轻，一气呵成"],
        sentences: [
          { en: "The boy enjoys his toy.", zh: "男孩很喜欢他的玩具。" },
          { en: "Boil some oil for the food.", zh: "为食物煮些油。" },
        ],
        words: [
          { word: "Boy", zh: "男孩" },
          { word: "Toy", zh: "玩具" },
          { word: "Voice", zh: "声音" },
        ],
      },
      {
        ipa: "/əʊ/",
        type: "双元音 · 合口双元音",
        tips: ["从 /ə/ 滑向 /ʊ/", "双唇由扁平收圆", "前重后轻，尾音轻短"],
        sentences: [
          { en: "I know the old road.", zh: "我知道那条老路。" },
          { en: "Go home and close the window.", zh: "回家把窗户关上。" },
        ],
        words: [
          { word: "Home", zh: "家" },
          { word: "Road", zh: "路" },
          { word: "Window", zh: "窗户" },
        ],
      },
      {
        ipa: "/aʊ/",
        type: "双元音 · 合口双元音",
        tips: ["从 /a/ 滑向 /ʊ/", "口型由大收到圆", "前重后轻，不要断开"],
        sentences: [
          { en: "The cow is down the hill.", zh: "奶牛在山脚下。" },
          { en: "How about going out now?", zh: "现在出去怎么样？" },
        ],
        words: [
          { word: "Cow", zh: "奶牛" },
          { word: "House", zh: "房子" },
          { word: "Flower", zh: "花" },
        ],
      },
      {
        ipa: "/ɪə/",
        type: "双元音 · 集中双元音",
        tips: ["从 /ɪ/ 滑向 /ə/", "舌位由高到中", "口型放松，尾音轻"],
        sentences: [
          { en: "Please come here and hear me.", zh: "请过来听我说。" },
          { en: "The deer is near the tree.", zh: "鹿在树附近。" },
        ],
        words: [
          { word: "Near", zh: "附近的" },
          { word: "Here", zh: "这里" },
          { word: "Beer", zh: "啤酒" },
        ],
      },
      {
        ipa: "/eə/",
        type: "双元音 · 集中双元音",
        tips: ["从 /e/ 滑向 /ə/", "口型由半开放松", "前重后轻，收在中央元音"],
        sentences: [
          { en: "Take care of your hair.", zh: "照顾好你的头发。" },
          { en: "The chair is over there.", zh: "椅子在那边。" },
        ],
        words: [
          { word: "Hair", zh: "头发" },
          { word: "Chair", zh: "椅子" },
          { word: "Care", zh: "照顾" },
        ],
      },
      {
        ipa: "/ʊə/",
        type: "双元音 · 集中双元音",
        tips: ["从 /ʊ/ 滑向 /ə/", "双唇先圆后放松", "前重后轻，尾音轻短"],
        sentences: [
          { en: "Make sure the tour is safe.", zh: "确保这次旅行安全。" },
          { en: "The poor man needs pure water.", zh: "这个可怜的人需要纯净水。" },
        ],
        words: [
          { word: "Tour", zh: "旅行" },
          { word: "Sure", zh: "确定的" },
          { word: "Poor", zh: "贫穷的" },
        ],
      },
    ],
  },
];

/** 整页音标总数，设计稿副标题里的「48个音标」 */
export const PHONETIC_TOTAL = 48;
