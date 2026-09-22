export function formatPracticeMinutes(total: string | number | null | undefined = 0) {
  const t = Math.max(0, Number(total) || 0);
  return `${Math.floor(t / 60)}分钟`;
}

export function formatHowLong(total = 0) {
  const t = Number(total) || 0;
  if (t === 0) return "没有学习";
  if (t < 60) return "不足1分钟";
  const days = Math.floor(t / 86400);
  const hours = Math.floor((t % 86400) / 3600);
  const minutes = Math.floor((t % 3600) / 60);
  const seconds = t % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (seconds > 0) parts.push(`${seconds}秒`);
  return parts.join("") || "没有学习";
}

export function formatDurationParts(total = 0) {
  const t = Math.max(0, Number(total) || 0);
  return {
    hours: Math.floor(t / 3600),
    minutes: Math.floor((t % 3600) / 60),
  };
}

export function formatRankTime(total = 0) {
  const t = Number(total) || 0;
  if (t === 0) return "没有学习";
  if (t < 60) return "不足1分钟";
  const days = Math.floor(t / 86400);
  const hours = Math.floor((t % 86400) / 3600);
  const minutes = Math.floor((t % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${String(days).padStart(2, "0")}天`);
  if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, "0")}小时`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${String(minutes).padStart(2, "0")}分钟`);
  return parts.join("") || "没有学习";
}

export function currentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * 学习计划的「最近学习」文案：今天 / 昨天 / N天前 / M月D日 / 跨年给完整日期。
 * 传空（从未学过）返回空串，由调用方显示「还未开始」。
 */
export function formatStudyTime(value: string | null | undefined, now = new Date()) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  // 兼容 "yyyy-MM-dd HH:mm:ss" 与 ISO：按本地时间解析（"yyyy/MM/dd" 在各浏览器都稳）
  const date = new Date(raw.replace(/-/g, "/").replace("T", " ").replace(/\.\d+.*$/, ""));
  if (Number.isNaN(date.getTime())) return raw;
  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(now) - dayStart(date)) / 86400000);
  if (days <= 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (date.getFullYear() === now.getFullYear()) return `${date.getMonth() + 1}月${date.getDate()}日`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function shiftYearMonth(value: string, delta: number) {
  const [year, month] = value.split("-").map(Number);
  const next = new Date(year, month - 1 + delta, 1);
  return currentYearMonth(next);
}

export function isFutureMonth(value: string, now = new Date()) {
  const [year, month] = value.split("-").map(Number);
  const cur = new Date(now.getFullYear(), now.getMonth(), 1);
  const target = new Date(year, month - 1, 1);
  return target > cur;
}
