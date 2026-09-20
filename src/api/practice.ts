import { BASE_URL, get, post } from "./http";

export type PracticeMode = 0 | 1 | 2 | 3;

export interface PracticeSettings {
  autoPlay?: boolean;
  playCount?: number;
  hintLevel?: number;
  caseSensitive?: boolean;
  punctuationSensitive?: boolean;
  evalModel?: string;
  translateType?: number;
  showAnalysis?: boolean;
  seconds?: number;
}

export interface PracticeItem {
  id?: number | string;
  kind?: string;
  itemType?: number;
  mode?: number;
  modeKey?: string;
  index?: number;
  itemId?: number | string;
  sort?: number;
  content?: string;
  audio?: string | null;
  pic?: string | null;
  phoneticHint?: string;
  settings?: PracticeSettings;
}

export interface PracticeWord {
  surface?: string;
  display?: string;
  chinese?: string;
  pos?: string;
  phoneticUk?: string;
  phoneticUs?: string;
}

export interface PracticeClause {
  clauseIndex?: number;
  type?: string;
  explanation?: string;
}

export interface PracticeSentence {
  sentenceId?: number | string;
  lessonId?: number | string;
  itemType?: number;
  content?: string;
  chinese?: string;
  explanation?: string;
  pic?: string | null;
  audio?: string | null;
  words?: PracticeWord[];
  clauses?: PracticeClause[];
  practices?: PracticeItem[];
}

export interface PracticeMeta {
  lessonId?: number | string;
  page?: number;
  limit?: number;
  itemTotal?: number;
  exerciseTotal?: number;
  hasMore?: boolean;
  progressIndex?: number;
  typingSeconds?: number;
  translateSeconds?: number;
}

export interface PracticePayload {
  meta?: PracticeMeta;
  sentences?: PracticeSentence[];
}

export interface PracticeResult {
  result?: "correct" | "wrong" | string;
  expected?: string;
  nextIndex?: number;
  finished?: boolean;
}

/** 口语评测：一次性票据（取票 → 连 ws → 推音频 → 收结果）。 */
export interface SpeechTicket {
  /** 一次性票据，放进长连接的查询串，连过一次即作废 */
  ticket: string;
  /** 长连接路径，不要写死，服务端可能调整 */
  wsPath: string;
  /** 只有服务端配了公网地址（前后端不同域）才有，有就直接用 */
  url?: string;
  /** 过期时间戳（Long 序列化成了字符串） */
  expiresAt?: string | number;
  /** 有效秒数，默认 120 */
  ttlSeconds?: number;
}

/** 逐词评分：content 是讯飞切出的词形，dpMessage 非 0 表示漏读/错读 */
export interface SpeechWordScore {
  content?: string;
  score?: number;
  dpMessage?: number;
}

/** 多维分：总分 + 准确度 / 流利度 / 标准度 / 完整度（个别题型可能缺键） */
export interface SpeechScore {
  score?: number;
  accuracy?: number;
  fluency?: number;
  standard?: number;
  integrity?: number;
  words?: SpeechWordScore[];
}

export interface SpeechResult extends PracticeResult {
  speech?: SpeechScore;
}

/** 带 HTTP 状态码的错误，方便按文档第 4 节映射提示 */
export type SpeechError = Error & { status?: number };

function createSpeechError(message: string, status?: number): SpeechError {
  const error = new Error(message) as SpeechError;
  error.name = "SpeechError";
  if (status != null) error.status = status;
  return error;
}

export function fetchLessonPractice(
  lessonId: string | number,
  params?: { page?: number; limit?: number },
) {
  return get<PracticePayload>(`/lessons/${lessonId}/practice`, {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });
}

export async function fetchAllLessonPractice(lessonId: string | number) {
  localStorage.setItem("lessonId", String(lessonId));
  const sentences: PracticeSentence[] = [];
  let page = 1;
  let meta: PracticeMeta = {};
  for (;;) {
    const data = await fetchLessonPractice(lessonId, { page, limit: 10 });
    sentences.push(...(data?.sentences || []));
    meta = data?.meta || {};
    if (!meta.hasMore) break;
    page += 1;
    if (page > 50) break;
  }
  return { meta, sentences };
}

export function submitPractice(body: {
  lessonId: string | number;
  itemId: string | number;
  mode: number;
  answer: string;
}) {
  return post<PracticeResult>("/practice/submit", body);
}

export function submitSpeech(params: {
  lessonId: string | number;
  itemId: string | number;
  audio: Blob;
  filename?: string;
}) {
  const fd = new FormData();
  fd.append("audio", params.audio, params.filename || "say.webm");
  fd.append("lessonId", String(params.lessonId));
  fd.append("itemId", String(params.itemId));
  return post<PracticeResult>("/practice/submit-speech", fd, {
    params: { lessonId: params.lessonId, itemId: params.itemId },
  });
}

/** ① 取票：每次评测都要新票据（连过一次即作废，重试也要重新取）。 */
export function fetchSpeechTicket(body: {
  lessonId: string | number;
  itemId: string | number;
}) {
  return post<SpeechTicket>("/practice/speech/ticket", body, { timeout: 15000 });
}

/** 票据里的 url 优先用；没有就按同源（开发环境走 Vite 代理）拼 ws 地址。 */
function speechWsUrl(data: SpeechTicket): string {
  const ticket = encodeURIComponent(data.ticket);
  if (data.url) {
    if (data.url.includes("ticket=")) return data.url;
    return `${data.url}${data.url.includes("?") ? "&" : "?"}ticket=${ticket}`;
  }
  if (/^https?:\/\//i.test(BASE_URL)) {
    const base = new URL(BASE_URL);
    const origin = `${base.protocol === "https:" ? "wss" : "ws"}://${base.host}`;
    return `${origin}${data.wsPath}?ticket=${ticket}`;
  }
  const origin = window.location.origin.replace(/^http/i, "ws");
  return `${origin}${data.wsPath}?ticket=${ticket}`;
}

/**
 * ②~⑤ 口语评测：内部完成「取票 → 连长连接 → 推 16k WAV → 收多维分」。
 *
 * 一次评测正常约 10 秒，超过 timeoutMs 视为失败；调用方要重试时需要重新调用本函数
 * （票据一次性，不能复用）。
 */
export function evaluateSpeech(params: {
  lessonId: string | number;
  itemId: string | number;
  wavBlob: Blob;
  timeoutMs?: number;
}): Promise<SpeechResult> {
  const { lessonId, itemId, wavBlob, timeoutMs = 90000 } = params;

  return new Promise<SpeechResult>((resolve, reject) => {
    let settled = false;
    let socket: WebSocket | null = null;
    let timer: number | undefined;

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      if (timer) window.clearTimeout(timer);
      try {
        socket?.close();
      } catch {
        /* ignore */
      }
      action();
    };
    const succeed = (result: SpeechResult) => finish(() => resolve(result));
    const fail = (error: SpeechError) => finish(() => reject(error));

    void (async () => {
      try {
        const ticket = await fetchSpeechTicket({ lessonId, itemId });
        if (settled) return;

        socket = new WebSocket(speechWsUrl(ticket));
        socket.binaryType = "arraybuffer";
        timer = window.setTimeout(() => fail(createSpeechError("评测超时，请重试")), timeoutMs);

        socket.onmessage = async (event: MessageEvent) => {
          let message: {
            type?: string;
            result?: SpeechResult;
            error?: { status?: number; message?: string };
          };
          try {
            message = JSON.parse(String(event.data));
          } catch {
            return;
          }

          if (message.type === "connected") {
            socket?.send(JSON.stringify({ type: "speech.request", audioFormat: "wav" }));
          } else if (message.type === "ready") {
            const bytes = new Uint8Array(await wavBlob.arrayBuffer());
            const chunkSize = 64 * 1024;
            for (let offset = 0; offset < bytes.length; offset += chunkSize) {
              socket?.send(bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
            }
            socket?.send(JSON.stringify({ type: "speech.end" }));
          } else if (message.type === "speech.result") {
            succeed(message.result || {});
          } else if (message.type === "error") {
            fail(createSpeechError(message.error?.message || "评测失败", message.error?.status));
          }
        };
        socket.onerror = () => fail(createSpeechError("评测连接失败，请重试"));
        socket.onclose = (event) => {
          const rejected = event.code === 1008;
          fail(
            createSpeechError(
              rejected ? "评测凭证已失效，请重新录制" : `评测连接被关闭（${event.code}）`,
              rejected ? 403 : undefined,
            ),
          );
        };
      } catch (error) {
        fail(error instanceof Error ? (error as SpeechError) : createSpeechError(String(error)));
      }
    })();
  });
}

export function syncLessonProgress(
  lessonId: string | number,
  body: { progressIndex: number; status?: 0 | 1 },
) {
  return post(`/lessons/${lessonId}/progress`, body);
}

/** `GET /lessons/{id}/next` 返回的下一章信息（没有下一章时 lessonId=null、hasNext=false） */
export interface NextLessonVo {
  courseId?: number | string | null;
  lessonId?: number | string | null;
  name?: string | null;
  num?: number | string | null;
  unitNo?: number | string | null;
  unitLabel?: string | null;
  unitTitle?: string | null;
  hasNext?: boolean;
}

/** 查询下一章（完成弹窗的「下一章」用） */
export function fetchNextLesson(lessonId: string | number) {
  return get<NextLessonVo>(`/lessons/${lessonId}/next`, undefined, { skipAuthRedirect: true });
}

export function sendStudyHeartbeat(body: {
  lessonId?: string | number;
  source: 1 | 2 | 3 | 4;
  seconds: number;
  sentenceCount?: number;
  wordCount?: number;
  /** 本次完成的单词内容项 id（方案 A：单词库务必带上，≤100 个，雪花 id 传字符串） */
  itemIds?: Array<string | number>;
}) {
  return post("/study/heartbeat", body);
}
