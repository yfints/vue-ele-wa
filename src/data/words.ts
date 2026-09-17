/**
 * 单词库列表数据。
 * 后端目前没有词库列表接口，先按设计稿的数据占位，接口就绪后替换 `wordBooks` 即可。
 */

export interface WordBook {
  id: number;
  title: string;
  desc: string;
  /** 卡片上的两个标签 */
  tags: string[];
  /** 所属分类（对应顶部筛选） */
  category: string;
  /** 已学进度 0-100 */
  learned: number;
  /** 封面顶部渐变色，向下过渡到白色 */
  tone: string;
  icon: string;
}

export const wordCategories = [
  "全部",
  "零基础",
  "日常高频",
  "商务办公",
  "旅行用语",
  "考试必备",
  "生活场景",
];

export const wordBooks: WordBook[] = [
  {
    id: 1,
    title: "零基础核心500词",
    desc: "从0开始，掌握最常用的500个英语单词",
    tags: ["零基础", "日常必备"],
    category: "零基础",
    learned: 69,
    tone: "#E2E3FE",
    icon: "/clone-assets/words/icon-01.png",
  },
  {
    id: 2,
    title: "日常高频500词",
    desc: "覆盖日常生活中最常用的高频词汇",
    tags: ["日常场景", "口语提升"],
    category: "日常高频",
    learned: 0,
    tone: "#FEE2F0",
    icon: "/clone-assets/words/icon-02.png",
  },
  {
    id: 3,
    title: "商务英语核心词汇",
    desc: "职场沟通、会议、邮件常用词汇",
    tags: ["商务办公", "职场提升"],
    category: "商务办公",
    learned: 100,
    tone: "#FAE1D0",
    icon: "/clone-assets/words/icon-03.png",
  },
  {
    id: 4,
    title: "旅行必备300词",
    desc: "出国旅游必备词汇，轻松应对各种场景",
    tags: ["旅行出国", "场景使用"],
    category: "旅行用语",
    learned: 0,
    tone: "#CEE5FF",
    icon: "/clone-assets/words/icon-04.png",
  },
  {
    id: 5,
    title: "雅思核心词汇",
    desc: "精选雅思考试高频词汇",
    tags: ["零基础", "日常必备"],
    category: "考试必备",
    learned: 0,
    tone: "#FAE9C2",
    icon: "/clone-assets/words/icon-05.png",
  },
  {
    id: 6,
    title: "生活场景800词",
    desc: "覆盖衣食住行等生活常用词汇",
    tags: ["生活场景", "实用口语"],
    category: "生活场景",
    learned: 69,
    tone: "#CAF1D3",
    icon: "/clone-assets/words/icon-06.png",
  },
  {
    id: 7,
    title: "常见近义词辨析",
    desc: "掌握常见近义词的用法和区别",
    tags: ["词汇进阶", "语法提升"],
    category: "考试必备",
    learned: 0,
    tone: "#FAE9C2",
    icon: "/clone-assets/words/icon-07.png",
  },
  {
    id: 8,
    title: "留学生活词汇",
    desc: "学习社交场景词汇",
    tags: ["旅行出国", "海外生活"],
    category: "生活场景",
    learned: 0,
    tone: "#CEE5FF",
    icon: "/clone-assets/words/icon-08.png",
  },
  {
    id: 9,
    title: "留学生活词汇",
    desc: "学习社交场景词汇",
    tags: ["旅行出国", "海外生活"],
    category: "生活场景",
    learned: 0,
    tone: "#FFCECE",
    icon: "/clone-assets/words/icon-09.png",
  },
  {
    id: 10,
    title: "餐饮英语200词",
    desc: "点餐、就餐、食物相关词汇",
    tags: ["生活必备", "出国必备"],
    category: "生活场景",
    learned: 0,
    tone: "#E2E3FE",
    icon: "/clone-assets/words/icon-10.png",
  },
  {
    id: 11,
    title: "常见近义词辨析",
    desc: "掌握常见近义词的用法和区别",
    tags: ["词汇进阶", "语法提升"],
    category: "考试必备",
    learned: 0,
    tone: "#CEE5FF",
    icon: "/clone-assets/words/icon-11.png",
  },
  {
    id: 12,
    title: "高频动词解析",
    desc: "最常用的动词，丰富你的表达",
    tags: ["词汇进阶", "语法提升"],
    category: "日常高频",
    learned: 0,
    tone: "#CAF1D3",
    icon: "/clone-assets/words/icon-12.png",
  },
];

/** 详情页的单词行 */
export interface WordRow {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
}

/**
 * 单词列表（设计稿里每页 10 条 × 5 页）。
 * 后端还没有「词书 → 单词」的接口，这里先用占位数据，接口就绪后替换即可。
 */
const RAW_WORDS: [string, string, string][] = [
  ["Apple", "/ˈæpəl/", "n. 苹果"],
  ["beautiful", "/ˈbjuːtɪfəl/", "adj. 美丽的；漂亮的"],
  ["computer", "/kəmˈpjuːtə/", "n. 电脑；计算机"],
  ["dictionary", "/ˈdɪkʃənəri/", "n. 字典；词典"],
  ["elephant", "/ˈelɪfənt/", "n. 大象"],
  ["family", "/ˈfæməli/", "n. 家庭；家人"],
  ["garden", "/ˈgɑːdən/", "n. 花园；庭院"],
  ["internet", "/ˈɪntənet/", "n. 互联网；因特网"],
  ["kitchen", "/ˈkɪtʃɪn/", "n. 厨房"],
  ["journey", "/ˈdʒɜːni/", "n. 旅行；旅程"],
  ["library", "/ˈlaɪbrəri/", "n. 图书馆"],
  ["mountain", "/ˈmaʊntɪn/", "n. 山；山脉"],
  ["notebook", "/ˈnəʊtbʊk/", "n. 笔记本"],
  ["orange", "/ˈɒrɪndʒ/", "n. 橙子；橙色"],
  ["pencil", "/ˈpensəl/", "n. 铅笔"],
  ["question", "/ˈkwestʃən/", "n. 问题"],
  ["rabbit", "/ˈræbɪt/", "n. 兔子"],
  ["school", "/skuːl/", "n. 学校"],
  ["teacher", "/ˈtiːtʃə/", "n. 老师"],
  ["umbrella", "/ʌmˈbrelə/", "n. 雨伞"],
  ["village", "/ˈvɪlɪdʒ/", "n. 村庄"],
  ["window", "/ˈwɪndəʊ/", "n. 窗户"],
  ["yellow", "/ˈjeləʊ/", "adj. 黄色的"],
  ["zoo", "/zuː/", "n. 动物园"],
  ["answer", "/ˈɑːnsə/", "n. 答案；回答"],
  ["bridge", "/brɪdʒ/", "n. 桥"],
  ["camera", "/ˈkæmərə/", "n. 照相机"],
  ["doctor", "/ˈdɒktə/", "n. 医生"],
  ["evening", "/ˈiːvnɪŋ/", "n. 傍晚；晚上"],
  ["friend", "/frend/", "n. 朋友"],
  ["guitar", "/gɪˈtɑː/", "n. 吉他"],
  ["hospital", "/ˈhɒspɪtəl/", "n. 医院"],
  ["island", "/ˈaɪlənd/", "n. 岛"],
  ["jacket", "/ˈdʒækɪt/", "n. 夹克衫"],
  ["keyboard", "/ˈkiːbɔːd/", "n. 键盘"],
  ["language", "/ˈlæŋgwɪdʒ/", "n. 语言"],
  ["machine", "/məˈʃiːn/", "n. 机器"],
  ["nature", "/ˈneɪtʃə/", "n. 大自然"],
  ["ocean", "/ˈəʊʃən/", "n. 海洋"],
  ["picture", "/ˈpɪktʃə/", "n. 图片；照片"],
  ["quarter", "/ˈkwɔːtə/", "n. 四分之一；一刻钟"],
  ["river", "/ˈrɪvə/", "n. 河流"],
  ["station", "/ˈsteɪʃən/", "n. 车站"],
  ["travel", "/ˈtrævəl/", "v. 旅行"],
  ["university", "/ˌjuːnɪˈvɜːsəti/", "n. 大学"],
  ["vacation", "/vəˈkeɪʃən/", "n. 假期"],
  ["weather", "/ˈweðə/", "n. 天气"],
  ["exercise", "/ˈeksəsaɪz/", "n. 锻炼；练习"],
  ["yesterday", "/ˈjestədeɪ/", "adv. 昨天"],
  ["zebra", "/ˈzebrə/", "n. 斑马"],
];

export const wordRows: WordRow[] = RAW_WORDS.map(([word, phonetic, meaning], index) => ({
  id: index + 1,
  word,
  phonetic,
  meaning,
}));
