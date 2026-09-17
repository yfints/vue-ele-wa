import { computed, ref, watch } from "vue";

export type GameType = "Sentence" | "Word" | "Phonetic";
export type GameMode =
  | "SentenceTranslate"
  | "SentenceListen"
  | "SentenceTypeing"
  | "SentenceOral";
export type PracticeMode = 0 | 1 | 2 | 3;

export const MODE_TO_PRACTICE: Record<GameMode, PracticeMode> = {
  SentenceListen: 0,
  SentenceTypeing: 1,
  SentenceOral: 2,
  SentenceTranslate: 3,
};

export const PRACTICE_TO_MODE: Record<PracticeMode, GameMode> = {
  0: "SentenceListen",
  1: "SentenceTypeing",
  2: "SentenceOral",
  3: "SentenceTranslate",
};

export interface GameSession {
  courseId: string;
  chapterId: string;
  gameTitle: string;
  courseName: string;
  gameType: GameType;
  gameMode: GameMode;
  practiceMode: PracticeMode;
  userLessonId: string;
  /** 从单词表点进来时记住点中的那个单词，加载页据此定位起始题 */
  startItemId?: string;
}

export interface PracticeSettings {
  autoPlay?: boolean;
  playCount?: number;
  hintLevel?: number;
  caseSensitive?: boolean;
  punctuationSensitive?: boolean;
  translateType?: number;
  showAnalysis?: boolean;
  seconds?: number;
}

export interface GameSentence {
  id: number;
  chinese: string;
  english: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  part_of_speech?: string;
  audio?: string;
  pic?: string;
  itemId?: string;
  index?: number;
  mode?: number;
  phoneticHint?: string;
  settings?: PracticeSettings;
  explanation?: string;
  clauseExplanations?: string[];
  wordSurfaces?: string[];
}

export interface GameSetting {
  show_translate: boolean;
  ignore_case: boolean;
  success_auto_next: boolean;
  speaker_read_auto: boolean;
  typeing_show: boolean;
  show_sentence_pic: boolean;
  answer_auto_show_error_times: number;
}

const STORAGE_KEY = "wxs-game-session";
const LIST_KEY = "wxs-game-list";
const INDEX_KEY = "wxs-game-index";
const TIME_KEY = "wxs-game-time";
const SETTING_KEY = "wxs-game-setting";

function readSession(): GameSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameSession) : null;
  } catch {
    return null;
  }
}

function readList(): GameSentence[] {
  try {
    const raw = sessionStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as GameSentence[]) : [];
  } catch {
    return [];
  }
}

function readNumber(key: string) {
  const value = Number(sessionStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function readSetting(): GameSetting {
  try {
    const raw = localStorage.getItem(SETTING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameSetting>;
      const merged = { ...defaultSetting(), ...parsed };
      if (localStorage.getItem("wxs-autonext-v2") !== "1") {
        merged.success_auto_next = true;
        localStorage.setItem("wxs-autonext-v2", "1");
        localStorage.setItem(SETTING_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch {
    /* ignore */
  }
  return defaultSetting();
}

export function defaultSetting(): GameSetting {
  return {
    show_translate: true,
    ignore_case: true,
    success_auto_next: true,
    speaker_read_auto: true,
    typeing_show: true,
    show_sentence_pic: true,
    answer_auto_show_error_times: 0,
  };
}

export const gameSession = ref<GameSession | null>(readSession());
export const gameList = ref<GameSentence[]>(readList());
export const gameIndex = ref(readNumber(INDEX_KEY));
export const gameTime = ref(readNumber(TIME_KEY));
export const gameSetting = ref<GameSetting>(readSetting());
export const isImmersiveMode = ref(false);

export const currentSentence = computed(() => gameList.value[gameIndex.value]);

function persistList() {
  try {
    sessionStorage.setItem(LIST_KEY, JSON.stringify(gameList.value));
    sessionStorage.setItem(INDEX_KEY, String(gameIndex.value));
    sessionStorage.setItem(TIME_KEY, String(gameTime.value));
  } catch {
    /* ignore */
  }
}

export function gameBackPath(session = gameSession.value) {
  // 单词库进来的练习，退出后回词书详情而不是课程详情
  if (session?.gameType === "Word" && session.courseId) return `/words/${session.courseId}`;
  if (session?.courseId) return `/courseMall/${session.courseId}`;
  return "/courseMall/index";
}

export function saveGameInfo(partial: Partial<GameSession> = {}) {
  const merged = { ...(gameSession.value || ({} as GameSession)), ...partial };
  if (merged.gameMode && merged.practiceMode == null) {
    merged.practiceMode = MODE_TO_PRACTICE[merged.gameMode];
  }
  if (merged.practiceMode != null && !merged.gameMode) {
    merged.gameMode = PRACTICE_TO_MODE[merged.practiceMode];
  }
  gameSession.value = merged;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  persistList();
}

export function saveGameSetting(partial: Partial<GameSetting> = {}) {
  gameSetting.value = { ...gameSetting.value, ...partial };
  try {
    localStorage.setItem(SETTING_KEY, JSON.stringify(gameSetting.value));
  } catch {
    /* ignore */
  }
}

export function resetGameData() {
  gameList.value = [];
  gameIndex.value = 0;
  gameTime.value = 0;
  persistList();
}

watch([gameList, gameIndex, gameTime], persistList, { deep: true });

export function useGame() {
  return {
    gameSession,
    gameList,
    gameIndex,
    gameTime,
    gameSetting,
    isImmersiveMode,
    currentSentence,
    saveGameInfo,
    saveGameSetting,
    resetGameData,
  };
}
