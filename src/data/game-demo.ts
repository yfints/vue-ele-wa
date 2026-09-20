export interface GameSentence {
  id: number;
  chinese: string;
  english: string;
  phonetic_uk?: string;
}

export const demoSentences: GameSentence[] = [
  { id: 1, chinese: "你好。", english: "Hello.", phonetic_uk: "/həˈləʊ/" },
  { id: 2, chinese: "早上好。", english: "Good morning.", phonetic_uk: "/ɡʊd ˈmɔːnɪŋ/" },
  { id: 3, chinese: "晚上好。", english: "Good evening.", phonetic_uk: "/ɡʊd ˈiːvnɪŋ/" },
  { id: 4, chinese: "再见。", english: "Goodbye.", phonetic_uk: "/ˌɡʊdˈbaɪ/" },
  { id: 5, chinese: "回头见。", english: "See you later.", phonetic_uk: "/siː ju ˈleɪtə/" },
  { id: 6, chinese: "晚安。", english: "Good night.", phonetic_uk: "/ɡʊd naɪt/" },
  { id: 7, chinese: "欢迎。", english: "Welcome.", phonetic_uk: "/ˈwelkəm/" },
  { id: 8, chinese: "很高兴见到你。", english: "Nice to meet you.", phonetic_uk: "/naɪs tə miːt ju/" },
];
