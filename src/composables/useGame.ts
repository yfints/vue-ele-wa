import { computed, ref, watch } from "vue";

export type GameType = "Sentence" | "Word" | "Phonetic";
export type GameMode =
  | "SentenceTranslate"
  | "SentenceListen"
  | "SentenceTypeing"
  | "SentenceOral";

export interface GameSession {
  courseId: string;
  chapterId: string;
  gameTitle: string;
  courseName: string;
  gameType: GameType;
  gameMode: GameMode;
  userLessonId: string;
}

export interface GameSentence {
  id: number;
  chinese: string;
  english: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  part_of_speech?: string;
  audio?: string;
}

export interface GameSetting {
  show_translate: boolean;
  ignore_case: boolean;
  success_auto_next: boolean;
  speaker_read_auto: boolean;
  typeing_show: boolean;
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
    if (raw) return { ...defaultSetting(), ...(JSON.parse(raw) as GameSetting) };
  } catch {
    /* ignore */
  }
  return defaultSetting();
}

export function defaultSetting(): GameSetting {
  return {
    show_translate: true,
    ignore_case: true,
    success_auto_next: false,
    speaker_read_auto: true,
    typeing_show: true,
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

export function saveGameInfo(partial: Partial<GameSession> = {}) {
  const next = { ...(gameSession.value || ({} as GameSession)), ...partial };
  gameSession.value = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
