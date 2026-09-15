<template>
  <div class="gamePage gamePageFixed">
    <template v-if="hasGame">
    <GameHeader
      :title="session?.gameTitle || '练习'"
      :course-name="session?.courseName || ''"
      :index="gameIndex"
      :total="gameList.length"
      :clock="clock"
      :immersive="isImmersiveMode"
      :show-mode="session?.gameType !== 'Phonetic'"
      :is-desktop="isDesktop"
      :swing="swing"
      @exit="openLeave"
      @setting="settingOpen = true"
      @list="openList"
      @mode="modeRef?.open()"
      @pause="openPause"
      @reset="resetOpen = true"
      @feedback="feedbackOpen = true"
      @toggle-immersive="isImmersiveMode = !isImmersiveMode"
      @fullscreen="toggleFullscreen"
    />

    <div class="gameBody flex col ac jc">
      <GamePic v-if="showPic" :pic="current?.pic" />
      <template v-if="current && answering">
        <div
          v-if="showChinese && mode === 'SentenceTranslate' && translateType !== 1"
          class="mb50 tc ani size40 gameChinese"
        >
          {{ current.chinese }}
        </div>
        <GameWords
          v-if="mode === 'SentenceTranslate' && translateType !== 1"
          :key="`${gameIndex}-${current.id}-${mode}`"
          ref="wordsRef"
          :english="current.english"
          :ignore-case="gameSetting.ignore_case"
          :auto-show-times="gameSetting.answer_auto_show_error_times"
          @submit="onAnswerSubmit"
        />
        <GameListen
          v-else-if="mode === 'SentenceListen' || (mode === 'SentenceTranslate' && translateType === 1)"
          :key="`${gameIndex}-${current.id}-input`"
          ref="listenRef"
          :chinese="current.chinese"
          :phonetic-hint="current.phoneticHint"
          :placeholder="mode === 'SentenceListen' ? '输入你听到的英文' : '输入英文翻译'"
          @submit="onAnswerSubmit"
        />
        <GameTyping
          v-else-if="mode === 'SentenceTypeing'"
          :key="`${gameIndex}-${current.id}-type`"
          ref="typingRef"
          :english="current.english"
          :chinese="current.chinese"
          :part-of-speech="current.part_of_speech"
          :phonetic-hint="current.phoneticHint"
          :show-chinese="gameSetting.show_translate"
          :show-letters="gameSetting.typeing_show"
          :hint-level="current.settings?.hintLevel"
          :case-sensitive="current.settings?.caseSensitive"
          @success="onTypingSuccess"
          @next-key="onNextKey"
          @error-key="onErrorKey"
          @speak-word="speakWord"
        />
        <GameOral
          v-else
          :english="current.english"
          :chinese="current.chinese"
          :show-chinese="gameSetting.show_translate"
          :recording="recording"
          :evaluating="evaluating"
          :audio-url="oralAudioUrl"
          :hint="oralHint"
          :transcript="oralTranscript"
          @record="toggleRecord"
          @speak-word="speakWord"
        />
      </template>
      <GameSuccess
        v-else-if="current"
        :phonetic="phonetic"
        :words="successWords"
        :part-of-speech="current.part_of_speech"
        :chinese="current.chinese"
        :result="lastResult"
        :expected="lastExpected"
        :analysis="analysisText"
        :speech="oralScore"
      />
    </div>

    <GameBotbar
      :mode="mode"
      :immersive="isImmersiveMode"
      :disabled-prev="gameIndex === 0"
      :playing="playing"
      :recording="recording"
      :completed="oralCompleted"
      :answering="answering"
      :show-letters="gameSetting.typeing_show"
      :next-key="nextKey"
      :error-key="errorKey"
      :active-key="activeKey"
      :translate-type="translateType"
      @prev="prev"
      @next="next"
      @speak="speak"
      @record="toggleRecord"
      @submit="onBarSubmit"
      @reveal="wordsRef?.reveal()"
      @toggle-letters="toggleLetters"
      @key="onKeyboard"
    />

    <Teleport to="body">
      <div
        class="progress gameLearnProgress"
        role="progressbar"
        :aria-valuenow="learnPercent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="progress__value" :style="{ width: `${learnPercent}%` }" />
      </div>
    </Teleport>

    <ModePop ref="modeRef" />
    </template>

    <Teleport to="body">
      <div v-if="pauseOpen" class="searchLayer">
        <div class="van-overlay vanPopupMask" />
        <div class="van-popup van-popup--center" role="dialog">
          <div class="galssPop popXS">
            <div class="galssHead flex jb ac">
              <div class="size30 white">练习已暂停</div>
              <button type="button" class="img60 hand searchClose" aria-label="关闭" @click="resume">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
                  <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div class="size26 pl40 pr40 mt60 white">
              <div>您的学习进度已锁定～</div>
              <div class="mt30">中场休息，补充能量后再一起并肩作战吧！</div>
            </div>
            <div class="flex je mt60 pr40">
              <div class="smallConfirm" @click="resume">继续练习</div>
            </div>
            <div class="gap40" />
          </div>
        </div>
      </div>

      <div v-if="leaveOpen" class="searchLayer">
        <div class="van-overlay vanPopupMask" />
        <div class="van-popup van-popup--center" role="dialog">
          <div class="galssPop popXS">
            <div class="galssHead flex jb ac">
              <div class="size30 white">退出练习</div>
              <button type="button" class="img60 hand searchClose" aria-label="关闭" @click="resume">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
                  <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div class="size26 pl40 pr40 mt60 white">
              <div>确定退出本次练习吗？</div>
              <div class="mt30">学习进度会保存在当前课程里。</div>
            </div>
            <div class="flex je mt60 pr40 pb40">
              <div class="smallCancel mr20" @click="resume">继续练习</div>
              <div class="smallConfirm" @click="leave">返回课程</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="resetOpen" class="searchLayer">
        <div class="van-overlay vanPopupMask" />
        <div class="van-popup van-popup--center" role="dialog">
          <div class="galssPop popXS">
            <div class="galssHead flex jb ac">
              <div class="size30 white">重置进度</div>
              <button type="button" class="img60 hand searchClose" aria-label="关闭" @click="resetOpen = false">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
                  <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div class="size26 pl40 pr40 mt60 white">
              <div>请注意！重置会重新开始练习～</div>
              <div class="mt30">确定要开启全新的征程吗？</div>
            </div>
            <div class="flex je mt60 pr40 pb40">
              <div class="smallCancel mr20" @click="resetOpen = false">取消</div>
              <div class="smallConfirm" @click="resetProgress">确认</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="listOpen" class="searchLayer">
        <div class="van-overlay vanPopupMask" />
        <div class="van-popup van-popup--center listPop" role="dialog" aria-label="学习内容">
          <div class="galssPop popL">
            <div class="galssHead flex jb ac mb30">
              <div class="size30 white">学习内容</div>
              <button type="button" class="img60 hand searchClose" aria-label="关闭" @click="closeList">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
                  <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <el-scrollbar ref="listScrollbarRef" height="70vh">
              <div class="pl40 pr40">
                <div
                  v-for="(item, index) in gameList"
                  :key="item.id"
                  :ref="(el) => setListCell(el, index)"
                  class="listCell flex jb hand"
                  :class="{ listAct: index === gameIndex }"
                  @click="jumpTo(index)"
                >
                  <div class="minw0">
                    <div class="size26 lh40 bold6">{{ item.english }}</div>
                    <div class="size-22 opc6 mt20">{{ item.chinese }}</div>
                  </div>
                  <div class="size26 lh40 bold ml30 flex0 linearTxt"># {{ index + 1 }}</div>
                </div>
              </div>
            </el-scrollbar>
            <div class="gap40" />
          </div>
        </div>
      </div>
    </Teleport>

    <el-drawer v-if="hasGame" v-model="settingOpen" title="设置" size="20rem">
      <el-form label-position="left" label-width="8rem">
        <el-form-item label="显示翻译">
          <el-switch v-model="gameSetting.show_translate" @change="persistSetting" />
        </el-form-item>
        <el-form-item label="忽略大小写">
          <el-switch v-model="gameSetting.ignore_case" @change="persistSetting" />
        </el-form-item>
        <el-form-item label="答对自动下一题">
          <el-switch v-model="gameSetting.success_auto_next" @change="persistSetting" />
        </el-form-item>
        <el-form-item label="自动朗读">
          <el-switch v-model="gameSetting.speaker_read_auto" @change="persistSetting" />
        </el-form-item>
        <el-form-item label="打字显示字母">
          <el-switch v-model="gameSetting.typeing_show" @change="persistSetting" />
        </el-form-item>
        <el-form-item label="显示图片">
          <el-switch v-model="gameSetting.show_sentence_pic" @change="onTogglePic" />
        </el-form-item>
        <el-form-item label="错几次后显示答案">
          <el-input-number v-model="gameSetting.answer_auto_show_error_times" :min="0" :max="9" @change="persistSetting" />
        </el-form-item>
      </el-form>
    </el-drawer>

    <el-dialog v-if="hasGame" v-model="feedbackOpen" title="报告错误" width="28rem">
      <el-input v-model="feedbackText" type="textarea" :rows="4" placeholder="请输入错误描述" />
      <template #footer>
        <el-button @click="feedbackOpen = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { ScrollbarInstance } from "element-plus";
import GameHeader from "@/components/GameHeader.vue";
import GameWords from "@/components/GameWords.vue";
import GameListen from "@/components/GameListen.vue";
import GamePic from "@/components/GamePic.vue";
import GameTyping from "@/components/GameTyping.vue";
import GameSuccess from "@/components/GameSuccess.vue";
import GameBotbar from "@/components/GameBotbar.vue";
import GameOral from "@/components/GameOral.vue";
import ModePop from "@/components/ModePop.vue";
import {
  evaluateSpeech,
  sendStudyHeartbeat,
  submitPractice,
  syncLessonProgress,
  type SpeechError,
  type SpeechScore,
} from "@/api/practice";
import { pickAudioMime, RAW_AUDIO_CONSTRAINTS, toWav16k } from "@/lib/audio";
import {
  currentSentence,
  gameBackPath,
  gameIndex,
  gameList,
  gameSession,
  gameSetting,
  gameTime,
  isImmersiveMode,
  MODE_TO_PRACTICE,
  saveGameSetting,
} from "@/composables/useGame";
import { isPhone, initLayoutViewport } from "@/composables/useLayout";
import { formatClock, sameSentence } from "@/lib/gameText";
import { getToken } from "@/api/token";
import { ensureLogin } from "@/composables/useAuth";

const router = useRouter();
const session = computed(() => gameSession.value);
const current = computed(() => currentSentence.value);
const mode = computed(() => session.value?.gameMode || "SentenceTranslate");
const hasGame = computed(() => Boolean(session.value?.chapterId && gameList.value.length));
const answering = ref(true);
const pauseOpen = ref(false);
const leaveOpen = ref(false);
const resetOpen = ref(false);
const settingOpen = ref(false);
const listOpen = ref(false);
const listScrollbarRef = ref<ScrollbarInstance>();
const listCells: HTMLElement[] = [];
const feedbackOpen = ref(false);
const feedbackText = ref("");
const swing = ref(false);
const paused = ref(false);
const elapsed = ref(gameTime.value || 0);
const wordsRef = ref<{ submit: () => void; reveal: () => void; injectKey: (key: string) => void; getAnswer: () => string } | null>(null);
const typingRef = ref<{ typeKey: (key: string) => void } | null>(null);
const listenRef = ref<{ submit: () => void; getAnswer: () => string; markWrong: () => void } | null>(null);
const modeRef = ref<{ open: () => void } | null>(null);
const playing = ref(false);
const recording = ref(false);
const evaluating = ref(false);
const oralCompleted = ref(false);
const oralTranscript = ref("");
const oralHint = ref("");
const oralAudioBlob = ref<Blob | null>(null);
const oralAudioUrl = ref("");
const oralScore = ref<SpeechScore | null>(null);
const nextKey = ref("");
const errorKey = ref("");
const activeKey = ref("");
const submitting = ref(false);
const lastResult = ref("");
const lastExpected = ref("");
const playUsed = ref(0);
const answeredCount = ref(0);
let lastBeatAt = 0;
let tick: number | undefined;
let autoNextTimer: number | undefined;
let audioEl: HTMLAudioElement | null = null;
let stopViewport: (() => void) | undefined;
let recognition: SpeechRecognition | null = null;
let mediaStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: BlobPart[] = [];
let captureToken = 0;
let captureCancelled = false;
let oralGuard: number | undefined;

const isDesktop = computed(() => !isPhone.value);
const learnPercent = computed(() => {
  const total = gameList.value.length;
  if (!total) return 0;
  return Math.floor(Math.min(1, (gameIndex.value + 1) / total) * 10000) / 100;
});
const clock = computed(() => formatClock(elapsed.value));
const practiceMode = computed(
  () => session.value?.practiceMode ?? MODE_TO_PRACTICE[mode.value] ?? 3,
);
const translateType = computed(() => current.value?.settings?.translateType ?? 1);
const analysisText = computed(() => {
  if (!current.value?.settings?.showAnalysis) return "";
  const parts = [current.value.explanation, ...(current.value.clauseExplanations || [])].filter(Boolean);
  return parts.join("\n");
});
const showChinese = computed(() => {
  if (mode.value === "SentenceListen") return false;
  return gameSetting.value.show_translate;
});
const phonetic = computed(() => current.value?.phonetic_uk || current.value?.phonetic_us || "");
const successWords = computed(() => (current.value?.english || "").split(/\s+/).filter(Boolean));
const showPic = computed(() => gameSetting.value.show_sentence_pic && Boolean(current.value?.pic));

function persistSetting() {
  saveGameSetting({ ...gameSetting.value });
}

function onTogglePic() {
  persistSetting();
  if (gameSetting.value.show_sentence_pic && !current.value?.pic) {
    ElMessage.info("该课程还未生成图片");
  }
}

function toggleLetters() {
  saveGameSetting({ typeing_show: !gameSetting.value.typeing_show });
}

function shortcutBlocked() {
  return pauseOpen.value || leaveOpen.value || resetOpen.value || settingOpen.value || listOpen.value || feedbackOpen.value;
}

function markPlaying(on: boolean) {
  playing.value = on;
}

function speak() {
  const item = current.value;
  if (!item) return;
  const max = Number(item.settings?.playCount || 0);
  if (max > 0 && playUsed.value >= max) {
    ElMessage.info("已达到播放次数上限");
    return;
  }
  stopSpeak();
  playUsed.value += 1;
  if (item.audio) {
    audioEl = new Audio(item.audio);
    audioEl.onplay = () => markPlaying(true);
    audioEl.onended = () => markPlaying(false);
    audioEl.onerror = () => speakFallback(item.english);
    void audioEl.play().catch(() => speakFallback(item.english));
    return;
  }
  speakFallback(item.english);
}

function speakFallback(text: string) {
  if (!text) return;
  if (!window.speechSynthesis) {
    ElMessage.info("当前环境不支持朗读");
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.onstart = () => markPlaying(true);
  utter.onend = () => markPlaying(false);
  utter.onerror = () => markPlaying(false);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function stopSpeak() {
  audioEl?.pause();
  audioEl = null;
  window.speechSynthesis?.cancel();
  markPlaying(false);
}

function onKeyboard(key: string) {
  if (mode.value === "SentenceTypeing") {
    typingRef.value?.typeKey(key);
    activeKey.value = key.toUpperCase();
    window.setTimeout(() => {
      if (activeKey.value === key.toUpperCase()) activeKey.value = "";
    }, 200);
    return;
  }
  wordsRef.value?.injectKey(key);
}

function onNextKey(key: string) {
  nextKey.value = key.toUpperCase();
}

function onErrorKey(key: string) {
  errorKey.value = key.toUpperCase();
  window.setTimeout(() => {
    if (errorKey.value === key.toUpperCase()) errorKey.value = "";
  }, 400);
}

function speakWord(word: string) {
  speakFallback(word.replace(/[^a-zA-Z']/g, "") || word);
}

function onTypingSuccess() {
  void onAnswerSubmit(current.value?.english || "");
}

function onBarSubmit() {
  if (!answering.value) {
    next();
    return;
  }
  if (mode.value === "SentenceTranslate" && translateType.value !== 1) {
    wordsRef.value?.submit();
    return;
  }
  if (mode.value === "SentenceListen" || (mode.value === "SentenceTranslate" && translateType.value === 1)) {
    listenRef.value?.submit();
  }
}

function lessonId() {
  return session.value?.chapterId || "";
}

async function flushHeartbeat(seconds?: number) {
  const id = lessonId();
  const value = Math.min(120, Math.max(0, Math.floor(seconds ?? elapsed.value - lastBeatAt)));
  if (!id || value < 1) return;
  lastBeatAt = elapsed.value;
  try {
    await sendStudyHeartbeat({
      lessonId: id,
      source: 1,
      seconds: value,
      sentenceCount: answeredCount.value,
      wordCount: 0,
    });
    answeredCount.value = 0;
  } catch {
    /* 心跳失败不打断练习 */
  }
}

async function reportProgress(index: number, status: 0 | 1) {
  const id = lessonId();
  if (!id) return;
  try {
    await syncLessonProgress(id, { progressIndex: index, status });
  } catch {
    /* unwrap 已提示 */
  }
}

function isRetryInputMode() {
  return mode.value === "SentenceListen" || (mode.value === "SentenceTranslate" && translateType.value === 1);
}

function isWrongResult(result?: string) {
  const value = String(result ?? "").trim().toLowerCase();
  return value === "wrong" || value === "incorrect" || value === "false" || value === "0" || value === "fail";
}

async function applyResult(res: { result?: string; expected?: string; nextIndex?: number; finished?: boolean }, currentIndexValue: number) {
  if (isWrongResult(res.result) && isRetryInputMode()) {
    listenRef.value?.markWrong();
    return;
  }
  lastResult.value = res.result || "";
  lastExpected.value = isWrongResult(res.result) ? res.expected || "" : "";
  answering.value = false;
  answeredCount.value += 1;
  await reportProgress(currentIndexValue, 0);
  if (res.finished) {
    await reportProgress(currentIndexValue, 1);
    await flushHeartbeat();
    ElMessage.success("本轮练习已完成");
    await leave();
    return;
  }
  if (gameSetting.value.success_auto_next && !isWrongResult(res.result)) {
    if (autoNextTimer) clearTimeout(autoNextTimer);
    autoNextTimer = window.setTimeout(() => nextFromServer(res.nextIndex), 800);
  }
}

function nextFromServer(nextIndex?: number) {
  if (nextIndex == null) {
    next();
    return;
  }
  const found = gameList.value.findIndex((item) => Number(item.index) === Number(nextIndex));
  if (found >= 0) {
    gameIndex.value = found;
    resetItem();
    return;
  }
  next();
}

async function onAnswerSubmit(answer: string) {
  const item = current.value;
  const id = lessonId();
  const text = String(answer || "").trim();
  if (!item || !id) return;
  if (isRetryInputMode()) {
    if (!sameSentence(text, item.english, gameSetting.value.ignore_case)) {
      listenRef.value?.markWrong();
      return;
    }
  } else if (!text) {
    ElMessage.warning("答案不能为空");
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const res = await submitPractice({
      lessonId: id,
      itemId: item.itemId || item.id,
      mode: item.mode ?? practiceMode.value,
      answer: text,
    });
    await applyResult(res || {}, Number(item.index ?? 0));
  } catch {
    /* unwrap 已提示 */
  } finally {
    submitting.value = false;
  }
}

async function submitOralAudio(blob: Blob) {
  const item = current.value;
  const id = lessonId();
  if (!item || !id) return;
  if (submitting.value) return;
  submitting.value = true;
  evaluating.value = true;
  oralHint.value = "评测中…";
  try {
    // 浏览器录的是 webm/ogg/mp4，先转成服务端要的 16k/16bit/单声道 WAV
    const wav = await toWav16k(blob);
    // 取票 → 连 ws → 推音频 → 收多维分（票据一次性，每次评测都重新取）
    const res = await evaluateSpeech({
      lessonId: id,
      itemId: item.itemId || item.id || "",
      wavBlob: wav,
    });
    oralCompleted.value = true;
    oralScore.value = res?.speech || null;
    oralHint.value = "";
    await applyResult(res || { result: "correct" }, Number(item.index ?? 0));
  } catch (error) {
    oralScore.value = null;
    oralHint.value = speechErrorMessage(error);
  } finally {
    evaluating.value = false;
    submitting.value = false;
  }
}

/** 按文档第 4 节的错误表把后端提示翻译成给学员看的话 */
function speechErrorMessage(error: unknown) {
  const status = (error as SpeechError | null)?.status;
  // 只有评测链路自己抛的错误才把原文透出去，HTTP 层的英文报错统一换成兜底文案
  const message =
    error instanceof Error && error.name === "SpeechError" ? error.message : "";
  if (status === 403 || /票据/.test(message)) return "评测凭证已失效，请重新录制";
  if (/太短/.test(message)) return "说话时间太短，请完整朗读";
  if (/过长|2\s*分钟/.test(message)) return "录音请在 2 分钟内";
  if (/格式不受支持|格式无法识别|无法解析/.test(message)) return "录音格式异常，请重新录制";
  if (/过大/.test(message)) return "录音过大，请缩短录音";
  if (status === 503 || /繁忙|稍后重试/.test(message)) return "评测服务繁忙，请稍后重试";
  return message || "评测失败，请重试";
}

function getRecognizer(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

function toggleRecord() {
  // 判分完成后（含答错）本题不允许再次提交，只能切到下一题
  if (oralCompleted.value && !answering.value) {
    ElMessage.info("本题已提交，点击「下一题」继续");
    return;
  }
  // 评测中不允许重新开录，避免一次答题推多份音频
  if (evaluating.value) return;
  if (recording.value) {
    stopRecord();
    evaluating.value = true;
    window.setTimeout(() => {
      const blob = oralAudioBlob.value;
      if (!blob) {
        evaluating.value = false;
        oralHint.value = "没有录到声音，请再录一次";
        return;
      }
      void submitOralAudio(blob);
    }, 250);
    return;
  }
  startRecord();
}

function startRecord() {
  stopSpeak();
  oralTranscript.value = "";
  oralHint.value = "";
  releaseOralAudio();
  void startAudioCapture();
  const rec = getRecognizer();
  if (!rec) {
    recording.value = true;
    return;
  }
  recognition = rec;
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (event) => {
    const result = Array.from(event.results)
      .map((item) => item[0]?.transcript || "")
      .join(" ")
      .trim();
    oralTranscript.value = result;
    if (event.results[event.results.length - 1]?.isFinal) {
      oralTranscript.value = result;
    }
  };
  rec.onerror = () => {
    oralHint.value = "没有听清，请再录一次";
    recording.value = false;
  };
  rec.onend = () => {
    recording.value = false;
    stopAudioCapture();
  };
  recording.value = true;
  rec.start();
}

function stopRecord() {
  recognition?.stop();
  recognition = null;
  recording.value = false;
  stopAudioCapture();
}

async function startAudioCapture() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return;
  const token = ++captureToken;
  captureCancelled = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: RAW_AUDIO_CONSTRAINTS });
    if (token !== captureToken) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    mediaStream = stream;
    const mimeType = pickAudioMime();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    mediaRecorder = recorder;
    audioChunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) audioChunks.push(event.data);
    };

    recorder.onstop = () => {
      if (captureCancelled || !audioChunks.length) return;
      if (oralAudioUrl.value) URL.revokeObjectURL(oralAudioUrl.value);
      const blob = new Blob(audioChunks, { type: recorder.mimeType || "audio/webm" });

      oralAudioBlob.value = blob;
      oralAudioUrl.value = URL.createObjectURL(blob);



// 下载到本地
   /*   const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = downloadUrl;
      a.download = 'oral-audio.wav'; // 根据实际音频格式修改
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(downloadUrl);*/
    };
    recorder.start();
    // 兜底：服务端 >120 秒会拒，录满 2 分钟自动停止并提交
    if (oralGuard) window.clearTimeout(oralGuard);
    oralGuard = window.setTimeout(() => {
      if (recording.value) toggleRecord();
    }, 120000);
  } catch {
    /* 未授权麦克风时退化为仅语音识别转写 */
  }
}

function stopAudioCapture() {
  captureToken += 1;
  if (oralGuard) {
    window.clearTimeout(oralGuard);
    oralGuard = undefined;
  }
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try {
      mediaRecorder.stop();
    } catch {
      /* ignore */
    }
  }
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
  mediaRecorder = null;
}

function releaseOralAudio() {
  if (oralAudioUrl.value) URL.revokeObjectURL(oralAudioUrl.value);
  oralAudioUrl.value = "";
  oralAudioBlob.value = null;
}

function resetItem() {
  if (autoNextTimer) {
    clearTimeout(autoNextTimer);
    autoNextTimer = undefined;
  }
  answering.value = true;
  oralTranscript.value = "";
  oralHint.value = "";
  oralScore.value = null;
  oralCompleted.value = false;
  evaluating.value = false;
  lastResult.value = "";
  lastExpected.value = "";
  playUsed.value = 0;
  nextKey.value = "";
  errorKey.value = "";
  activeKey.value = "";
  recognition?.abort();
  recognition = null;
  stopAudioCapture();
  releaseOralAudio();
  recording.value = false;
}

function cancelRecording() {
  if (!recording.value) return false;
  captureCancelled = true;
  stopRecord();
  ElMessage.info("录音已取消");
  return true;
}

function next() {
  if (mode.value === "SentenceOral" && (evaluating.value || cancelRecording())) return;
  if (gameIndex.value >= gameList.value.length - 1) {
    finish();
    return;
  }
  gameIndex.value += 1;
  resetItem();
}

function prev() {
  if (mode.value === "SentenceOral" && (evaluating.value || cancelRecording())) return;
  if (gameIndex.value === 0) return;
  gameIndex.value -= 1;
  resetItem();
}

function setListCell(el: unknown, index: number) {
  if (el instanceof HTMLElement) listCells[index] = el;
}

async function openList() {
  listOpen.value = true;
  paused.value = true;
  await nextTick();
  const cell = listCells[gameIndex.value];
  if (cell) listScrollbarRef.value?.scrollTo({ top: cell.offsetTop, behavior: "smooth" });
}

function closeList() {
  listOpen.value = false;
  paused.value = false;
}

function jumpTo(index: number) {
  gameIndex.value = index;
  closeList();
  resetItem();
}

function resetProgress() {
  gameIndex.value = 0;
  resetOpen.value = false;
  resetItem();
}

async function finish() {
  ElMessage.success("本轮练习已完成");
  await leave();
}

function openPause() {
  pauseOpen.value = true;
  paused.value = true;
}

function openLeave() {
  leaveOpen.value = true;
  paused.value = true;
}

function resume() {
  pauseOpen.value = false;
  leaveOpen.value = false;
  listOpen.value = false;
  paused.value = false;
  if (!hasGame.value) {
    void router.replace("/gameLoad");
  }
}

async function leave() {
  pauseOpen.value = false;
  leaveOpen.value = false;
  gameTime.value = elapsed.value;
  await flushHeartbeat();
  await router.replace(gameBackPath(session.value));
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  void document.documentElement.requestFullscreen();
}

function submitFeedback() {
  if (!feedbackText.value.trim()) {
    ElMessage.warning("请输入错误描述");
    return;
  }
  feedbackOpen.value = false;
  feedbackText.value = "";
  ElMessage.success("提交成功");
}

function onShortcut(event: KeyboardEvent) {
  if (shortcutBlocked()) return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  const key = event.key;
  const currentMode = mode.value;

  if (event.shiftKey && (key === "ArrowLeft" || key === "ArrowRight")) {
    event.preventDefault();
    if (key === "ArrowLeft") prev();
    else next();
    return;
  }

  if ((key === "v" || key === "V") && currentMode !== "SentenceTypeing") {
    event.preventDefault();
    speak();
    return;
  }

  if (currentMode === "SentenceTranslate") {
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      wordsRef.value?.reveal();
    }
    if (!answering.value && (key === "ArrowLeft" || key === "ArrowRight")) {
      event.preventDefault();
      speak();
    }
    return;
  }

  if (currentMode === "SentenceListen") {
    if (key === "Enter") {
      event.preventDefault();
      onBarSubmit();
      return;
    }
    if (key === "ArrowLeft" || key === "ArrowRight") {
      event.preventDefault();
      speak();
    }
    return;
  }

  if (currentMode === "SentenceTypeing" && (key === " " || event.code === "Space")) {
    event.preventDefault();
    toggleLetters();
    return;
  }

  if (currentMode === "SentenceOral") {
    if (key === " " || event.code === "Space") {
      event.preventDefault();
      toggleRecord();
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      next();
    }
  }
}

function shouldAutoSpeak() {
  if (mode.value === "SentenceListen") return current.value?.settings?.autoPlay !== false;
  if (mode.value === "SentenceOral") return true;
  return gameSetting.value.speaker_read_auto;
}

watch(
  () => [gameIndex.value, mode.value],
  () => {
    if (shouldAutoSpeak()) {
      window.setTimeout(() => speak(), 300);
    }
  },
);

onMounted(() => {
  stopViewport = initLayoutViewport();
  window.addEventListener("keydown", onShortcut);
  if (!hasGame.value) {
    pauseOpen.value = true;
    paused.value = true;
    if (!getToken()) void ensureLogin({ message: "您还未登录或登录失效，是否前往登录？" });
    return;
  }
  elapsed.value = gameTime.value || 0;
  lastBeatAt = elapsed.value;
  tick = window.setInterval(() => {
    if (paused.value) return;
    elapsed.value += 1;
    if (elapsed.value > 0 && elapsed.value % 10 === 0) {
      void flushHeartbeat();
    }
    if (elapsed.value > 0 && elapsed.value % 60 === 0) {
      swing.value = true;
      window.setTimeout(() => {
        swing.value = false;
      }, 1000);
    }
  }, 1000);
  if (shouldAutoSpeak()) {
    window.setTimeout(() => speak(), 300);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", onShortcut);
  stopViewport?.();
  if (tick) clearInterval(tick);
  if (autoNextTimer) clearTimeout(autoNextTimer);
  stopRecord();
  stopSpeak();
  releaseOralAudio();
});
</script>
