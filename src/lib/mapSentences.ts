import type { GameSentenceItem } from "@/api/game";
import type { GameSentence } from "@/composables/useGame";

export function mapSentences(raw: GameSentenceItem[] | unknown[]): GameSentence[] {
  return raw
    .map((item, index) => {
      const row = item as GameSentenceItem;
      const practice = Array.isArray(row.practices) ? row.practices[0] : undefined;
      const english = String(row.content || row.english || practice?.content || practice?.english || "");
      const chinese = String(row.chinese || practice?.chinese || row.translate || "");
      return {
        id: Number(row.id || row.sentence_id || index + 1),
        chinese,
        english,
        phonetic_uk: row.phonetic_uk || practice?.phonetic_uk,
        phonetic_us: row.phonetic_us || practice?.phonetic_us,
        part_of_speech: row.part_of_speech || practice?.part_of_speech,
        audio: row.audio || practice?.audio,
      };
    })
    .filter((item) => item.chinese || item.english);
}
