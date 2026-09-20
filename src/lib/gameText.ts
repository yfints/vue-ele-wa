export function tokenize(sentence: string) {
  const parts = String(sentence || "").match(/[A-Za-z0-9']+|[^A-Za-z0-9'\s]+|\s+/g) || [];
  return parts
    .filter((part) => !/^\s+$/.test(part))
    .map((word) => ({
      word,
      isWord: /[A-Za-z0-9]/.test(word),
    }));
}

export function sameWord(input: string, target: string, ignoreCase = true) {
  const left = ignoreCase ? input.toLowerCase() : input;
  const right = ignoreCase ? target.toLowerCase() : target;
  return left.replace(/[^a-zA-Z0-9']/g, "") === right.replace(/[^a-zA-Z0-9']/g, "");
}

export function normalizeSentence(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sameSentence(input: string, target: string, ignoreCase = true) {
  const clean = (text: string) => {
    const value = ignoreCase ? String(text || "").toLowerCase() : String(text || "");
    return value.replace(/[^a-zA-Z0-9'\s]/g, " ").replace(/\s+/g, " ").trim();
  };
  const left = clean(input);
  const right = clean(target);
  return Boolean(right) && left === right;
}

export function oralMatch(heard: string, target: string) {
  const left = normalizeSentence(heard);
  const right = normalizeSentence(target);
  if (!left || !right) return false;
  if (left === right) return true;
  const heardWords = left.split(" ");
  const targetWords = right.split(" ");
  const hit = targetWords.filter((word) => heardWords.includes(word)).length;
  return targetWords.length > 0 && hit / targetWords.length >= 0.6;
}

export function formatClock(totalSeconds: number) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${String(h).padStart(2, "0")}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}
