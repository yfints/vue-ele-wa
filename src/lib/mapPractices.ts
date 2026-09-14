import type { PracticeItem, PracticeSentence } from "@/api/practice";
import type { GameSentence } from "@/composables/useGame";

export function pickPractices(sentences: PracticeSentence[] | undefined, mode: number): GameSentence[] {
  return (sentences || [])
    .flatMap((sentence) =>
      (sentence.practices || []).map((practice) => ({ sentence, practice })),
    )
    .filter(({ practice }) => Number(practice.mode) === mode)
    .sort((a, b) => Number(a.practice.index) - Number(b.practice.index))
    .map(({ sentence, practice }) => toGameSentence(sentence, practice));
}

function toGameSentence(sentence: PracticeSentence, practice: PracticeItem): GameSentence {
  const english =
    sentence.content ||
    (practice.mode === 1 || practice.mode === 2 ? practice.content : "") ||
    "";
  const chinese =
    practice.mode === 0 || practice.mode === 3
      ? practice.content || sentence.chinese || ""
      : sentence.chinese || "";
  return {
    id: Number(practice.index ?? 0),
    itemId: String(practice.itemId ?? ""),
    index: Number(practice.index ?? 0),
    mode: Number(practice.mode ?? 0),
    chinese: String(chinese),
    english: String(english),
    audio: practice.audio || sentence.audio || undefined,
    pic: practice.pic || sentence.pic || undefined,
    phoneticHint: practice.phoneticHint,
    phonetic_uk: practice.phoneticHint,
    settings: practice.settings,
    explanation: sentence.explanation,
    clauseExplanations: (sentence.clauses || [])
      .map((item) => item.explanation || "")
      .filter(Boolean),
    wordSurfaces: (sentence.words || [])
      .map((item) => item.surface || item.display || "")
      .filter(Boolean),
  };
}
