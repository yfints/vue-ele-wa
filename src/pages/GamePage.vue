<template>
  <PracticeView
    v-if="isPracticePage"
    :mode="isListenMode ? 'listen' : isTranslateInput ? 'translate' : 'oral'"
    :title="practiceTitle"
    :crumb="practiceCrumb"
    :clock="clock"
    :speed="speakRate"
    :index="gameIndex"
    :total="gameList.length"
    :english="current?.english || ''"
    :chinese="current?.chinese || ''"
    :show-chinese="showChinese"
    :playing="playing"
    :recording="recording"
    :evaluating="evaluating"
    :submitting="submitting"
    :hint="oralHint"
    :result="oralFeedback"
    :result-tone="oralFeedbackTone"
    :answer="listenAnswer"
    :answer-error="listenWrong"
    :answer-ok="listenAnswerOk"
    :listen-hint="listenFeedback"
    :listen-hint-tone="listenFeedbackTone"
    :can-prev="gameIndex > 0"
    :finish-visible="finishOpen"
    :finish-duration="finishDuration"
    :finish-count="gameList.length"
    @update:answer="listenAnswer = $event"
    @prev="prev"
    @next="next"
    @submit="onPracticeSubmit"
    @speak="speak"
    @exit="openLeave"
    @speed="onSpeedChange"
    @record-start="onOralRecordStart"
    @record-stop="onOralRecordStop"
    @finish-continue="onFinishContinue"
    @finish-next="onFinishNext"
    @finish-close="onFinishClose"
  />

  <div v-else class="gamePage gamePageFixed">
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
        :retryable="oralRetryable"
        @retry="toggleRecord"
      />
    </div>

    <GameBotbar
      :mode="mode"
      :immersive="isImmersiveMode"
      :disabled-prev="gameIndex === 0"
      :playing="playing"
      :recording="recording"
      :completed="oralCompleted"
      :retryable="oralRetryable"
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
  </div>

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
import PracticeView from "@/components/practice/PracticeView.vue";
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
import { localAsset } from "@/data/mall";

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
/** 单词库课时里本批已完成的单词内容项 id，随心跳上报（方案 A） */
const completedItemIds = ref<string[]>([]);
let lastBeatAt = 0;
let tick: number | undefined;
let autoNextTimer: number | undefined;
let audioEl: HTMLAudioElement | null = null;
let silentSourceUrl = "";
let audioUnlocked = false;
let speakToken = 0;
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

/** 口语 / 听力 / 中译英（整句）走新版设计稿练习页，其余模式仍是游戏态页面 */
const isListenMode = computed(() => mode.value === "SentenceListen");
/** 中译英：translateType=1 是整句默写（设计稿），2 是逐词拼句（仍是老页面） */
const isTranslateInput = computed(
  () => mode.value === "SentenceTranslate" && (current.value?.settings?.translateType ?? 1) === 1,
);
const isInputMode = computed(() => isListenMode.value || isTranslateInput.value);
const isPracticePage = computed(
  () => hasGame.value && (mode.value === "SentenceOral" || isInputMode.value),
);
const finishOpen = ref(false);
const practiceTitle = computed(() => {
  const course = String(session.value?.courseName || "").trim();
  const lesson = String(session.value?.gameTitle || "").trim();
  if (course && lesson && !course.includes(lesson)) return `${course}-${lesson}`;
  return lesson || course || "练习";
});
/** 播放倍速：存在 gameSetting（localStorage），练习页改完后续所有朗读都按它播 */
const speakRate = computed(() => Number(gameSetting.value.speak_rate) || 1);
/** 练习页顶部面包屑：从词书进来的显示「单词库」，其余是「课程详情」 */
const practiceCrumb = computed(() => (isWordSession() ? "单词库" : "课程详情"));
const finishDuration = computed(() => formatDuration(elapsed.value));
const oralFeedback = computed(() => {
  if (mode.value !== "SentenceOral" || answering.value) return "";
  if (isWrongResult(lastResult.value)) return "再试一次吧，可以重新录音";
  const score = Number(oralScore.value?.score ?? NaN);
  return Number.isFinite(score) ? `很棒！得分 ${Math.round(score)}` : "很棒！";
});
const oralFeedbackTone = computed<"" | "ok" | "bad">(() => {
  if (mode.value !== "SentenceOral" || answering.value) return "";
  return isWrongResult(lastResult.value) ? "bad" : "ok";
});

/** 听力 / 中译英：输入与反馈 */
const listenAnswer = ref("");
const listenWrong = ref(false);
let listenWrongTimer: number | undefined;
const listenAnswerOk = computed(
  () => isInputMode.value && !answering.value && !isWrongResult(lastResult.value),
);
const listenFeedback = computed(() => {
  if (!isInputMode.value) return "";
  const translate = isTranslateInput.value;
  if (listenWrong.value) return translate ? "没翻译对，再改改试试～" : "没听对，再听一遍试试～";
  if (answering.value) return "";
  if (isWrongResult(lastResult.value)) return translate ? "再想想，重新输入" : "再听一遍，重新输入";
  return translate ? "很棒！翻译正确" : "很棒！听写正确";
});
const listenFeedbackTone = computed<"" | "ok" | "bad">(() => {
  if (!isInputMode.value) return "";
  if (listenWrong.value) return "bad";
  if (answering.value) return "";
  return isWrongResult(lastResult.value) ? "bad" : "ok";
});

/** 听力答错：闪红并清空输入，让用户重听重填 */
function flashListenWrong() {
  if (!isPracticePage.value) {
    listenRef.value?.markWrong();
    return;
  }
  listenWrong.value = true;
  if (listenWrongTimer) window.clearTimeout(listenWrongTimer);
  listenWrongTimer = window.setTimeout(() => {
    listenWrong.value = false;
    listenAnswer.value = "";
  }, 700);
}

function formatDuration(total: number) {
  const value = Math.max(0, Math.floor(total || 0));
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
}

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
/** 口语答错后允许重新录制再提交；答对直接进入下一题，不需要重录 */
const oralRetryable = computed(
  () => mode.value === "SentenceOral" && isWrongResult(lastResult.value),
);

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
  // 播放次数在真正出声时才 +1（见 onplay / utter.onstart）：
  // 手机端自动播放常被浏览器拦下，如果这时就计数，用户手点「朗读」会直接提示"已达上限"而彻底没声
  // 有音频资源就播「当前 item.english 对应的」那段音频，没有再退回浏览器朗读
  if (item.audio) {
    const sources = audioSources(item.audio);
    if (sources.length) {
      playAudioUrl(sources, () => speakFallback(item.english));
      return;
    }
  }
  // audio 为 null：手机端浏览器语音合成经常不可用，直接用在线 TTS，失败再退回语音合成
  if (item.english) {
    playOnlineTts(item.english);
    return;
  }
  speakFallback(item.english);
}

/**
 * 音频地址候选：
 * 1) 和图片一样走 localAsset（res.waxueshe.com → /res-cdn 代理，绝对地址原样返回）
 * 2) 相对路径再补一个「当前后端域名」兜底（开发环境 localAsset 会补生产域名，真机可能 404）
 */
function audioSources(raw: string) {
  const list: string[] = [];
  const resolved = localAsset(raw);
  if (resolved) list.push(resolved);
  if (!/^(https?:|data:|blob:)/i.test(raw)) {
    const origin = (
      import.meta.env.DEV
        ? "http://test-jiaopei.zrgy-bbg.com"
        : import.meta.env.VITE_API_BASE_URL || ""
    ).replace(/\/$/, "");
    if (origin) {
      const fallback = `${origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
      if (!list.includes(fallback)) list.push(fallback);
    }
  }
  return list;
}

/** 生成一段 8bit 静音 WAV，用来在用户手势里解锁音频 */
function silentWavSource() {
  if (silentSourceUrl) return silentSourceUrl;
  const rate = 8000;
  const samples = 400;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeText(36, "data");
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128);
  silentSourceUrl = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  return silentSourceUrl;
}

function ensureAudioEl() {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/**
 * 手机端（iOS Safari / 微信）会拦截「非用户手势」的播放：
 * 先在第一次点击/触摸里用同一个 audio 元素播一次静音，后续自动朗读才不会被拦。
 */
function unlockAudio() {
  if (audioUnlocked) return;
  const el = ensureAudioEl();
  el.muted = true;
  el.src = silentWavSource();
  const started = el.play();
  if (!started || typeof started.then !== "function") {
    audioUnlocked = true;
    return;
  }
  void started
    .then(() => {
      audioUnlocked = true;
    })
    .catch((error: unknown) => {
      // 解锁时被"切歌"打断不算失败，其余情况留给下一次手势重试
      if ((error as DOMException | null)?.name !== "AbortError") audioUnlocked = false;
    });
}

/** 依次尝试候选音频地址；全部失败时执行 fallback */
function playAudioUrl(sources: string[], fallback?: () => void) {
  const el = ensureAudioEl();
  const list = sources.filter(Boolean);
  let index = 0;

  function next() {
    index += 1;
    if (index < list.length) {
      start();
      return;
    }
    console.warn("[audio] 音频加载失败：", list.join(" | "));
    fallback?.();
  }

  function start() {
    const url = list[index];
    el.muted = false;
    el.playbackRate = speakRate.value;
    el.onplay = () => {
      playUsed.value += 1;
      markPlaying(true);
    };
    el.onended = () => markPlaying(false);
    el.onerror = () => next();
    el.src = url;
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
    const started = el.play();
    if (!started || typeof started.catch !== "function") return;
    started.catch((error: unknown) => {
      markPlaying(false);
      // 自动播放被拦（NotAllowedError）不是加载失败，不要降级 TTS —— 手机端 TTS 同样会被拦
      if ((error as DOMException | null)?.name === "NotAllowedError") return;
      next();
    });
  }

  if (!list.length) {
    fallback?.();
    return;
  }
  start();
}

/**
 * audio 为 null 时的兜底朗读：
 * 先用浏览器语音合成；手机端常见「不报错也不出声」（没装语音引擎 / WebView 不支持），
 * 1.2 秒内没开始就换成在线 TTS，保证真机也有声音。
 */
function speakFallback(text: string, allowOnline = true) {
  const value = String(text || "").trim();
  if (!value) return;
  const token = ++speakToken;
  const synth = window.speechSynthesis;
  if (!synth) {
    if (allowOnline) playOnlineTts(value);
    return;
  }

  let handled = false;
  const fallbackToOnline = () => {
    if (handled || token !== speakToken) return;
    handled = true;
    if (allowOnline) playOnlineTts(value);
  };

  const utter = new SpeechSynthesisUtterance(value);
  utter.lang = "en-US";
  utter.rate = Math.min(2, 0.85 * speakRate.value);
  const voice = synth.getVoices().find((item) => /^en/i.test(item.lang));
  if (voice) utter.voice = voice;
  utter.onstart = () => {
    handled = true;
    playUsed.value += 1;
    markPlaying(true);
  };
  utter.onend = () => markPlaying(false);
  utter.onerror = () => {
    markPlaying(false);
    fallbackToOnline();
  };
  synth.cancel();
  synth.speak(utter);
  window.setTimeout(() => {
    if (handled || token !== speakToken) return;
    synth.cancel();
    fallbackToOnline();
  }, 1200);
}

/** 在线 TTS（有道发音）：audio 为 null 时的主用方案，失败再回退浏览器语音合成 */
function playOnlineTts(text: string) {
  const q = encodeURIComponent(text);
  playAudioUrl(
    [
      `https://dict.youdao.com/dictvoice?audio=${q}&type=2`,
      `https://dict.youdao.com/dictvoice?audio=${q}&type=1`,
    ],
    () => speakFallback(text, false),
  );
}

function stopSpeak() {
  speakToken += 1;
  if (audioEl) {
    audioEl.onplay = null;
    audioEl.onended = null;
    audioEl.onerror = null;
    audioEl.pause();
  }
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
  const text = word.replace(/[^a-zA-Z']/g, "") || word;
  if (!text) return;
  stopSpeak();
  playOnlineTts(text);
}

function onTypingSuccess() {
  void onAnswerSubmit(current.value?.english || "");
}

function onBarSubmit() {
  if (!answering.value) {
    next();
    return;
  }
  if (isPracticePage.value) {
    onPracticeSubmit();
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
  // 单词库课时：心跳要带 source=2 + 本次学完的单词 itemIds，服务端才会记「已学单词」
  const wordMode = isWordSession();
  const itemIds = wordMode ? [...completedItemIds.value] : [];
  try {
    await sendStudyHeartbeat({
      lessonId: id,
      source: wordMode ? 2 : 1,
      seconds: value,
      sentenceCount: wordMode ? 0 : answeredCount.value,
      wordCount: wordMode ? itemIds.length : 0,
      itemIds: itemIds.length ? itemIds : undefined,
    });
    answeredCount.value = 0;
    completedItemIds.value = [];
  } catch {
    /* 心跳失败不打断练习 */
  }
}

/** 单词库练习（从单词集进来的课时），心跳 source 用 2、并带已学单词 id */
function isWordSession() {
  return session.value?.gameType === "Word";
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
    flashListenWrong();
    return;
  }
  lastResult.value = res.result || "";
  lastExpected.value = isWrongResult(res.result) ? res.expected || "" : "";
  answering.value = false;
  answeredCount.value += 1;
  trackLearnedWord();
  await reportProgress(currentIndexValue, 0);
  if (res.finished) {
    await reportProgress(currentIndexValue, 1);
    await flushHeartbeat();
    if (isPracticePage.value) {
      finishOpen.value = true;
      paused.value = true;
      return;
    }
    ElMessage.success("本轮练习已完成");
    await leave();
    return;
  }
  if (gameSetting.value.success_auto_next && !isWrongResult(res.result)) {
    if (autoNextTimer) clearTimeout(autoNextTimer);
    autoNextTimer = window.setTimeout(() => nextFromServer(res.nextIndex), 800);
  }
}

/** 单词库：答完一题就把这个单词记进待上报列表（心跳时带 itemIds） */
function trackLearnedWord() {
  if (!isWordSession()) return;
  const item = current.value;
  const id = String(item?.itemId || item?.id || "");
  if (!id || completedItemIds.value.includes(id)) return;
  completedItemIds.value.push(id);
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
      flashListenWrong();
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
  // 400 直接用后端 message：「录音太短」「录音格式不受支持」这些原文就是给用户看的
  if (status === 400) return message || "录音有问题，请重新录制";
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
  // 判分完成后：答错可以重新录制再提交，答对直接进入下一题
  if (oralCompleted.value && !answering.value) {
    if (!oralRetryable.value) {
      ElMessage.info("本题已作答，点击「下一题」继续");
      return;
    }
    resetItem();
    startRecord();
    return;
  }
  // 评测中不允许重新开录，避免一次答题推多份音频
  if (evaluating.value) return;
  if (recording.value) {
    stopRecordAndEvaluate();
    return;
  }
  startRecord();
}

/** 停录并送评（松开麦克风、点「提交」、按空格都走这里） */
function stopRecordAndEvaluate() {
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
}

/** 设计稿：按住麦克风开始录音 */
function onOralRecordStart() {
  if (evaluating.value) return;
  if (!answering.value) {
    if (!oralRetryable.value) {
      ElMessage.info("本题已作答，点击「下一题」继续");
      return;
    }
    resetItem();
    startRecord();
    return;
  }
  if (!recording.value) startRecord();
}

/** 设计稿：松手结束录音并评测 */
function onOralRecordStop() {
  if (!recording.value) return;
  stopRecordAndEvaluate();
}

/** 设计稿：底部「提交」——录音中先停录，已判分则进入下一题 */
function onOralSubmit() {
  if (evaluating.value) return;
  if (recording.value) {
    stopRecordAndEvaluate();
    return;
  }
  if (!answering.value) {
    next();
    return;
  }
  if (oralAudioBlob.value) {
    void submitOralAudio(oralAudioBlob.value);
    return;
  }
  ElMessage.info("请先按住麦克风朗读句子");
}

function onSpeedChange(value: number) {
  // 倍速设置落到 localStorage（gameSetting），下次进练习页/下次朗读继续用它
  saveGameSetting({ speak_rate: Number(value) || 1 });
}

/** 设计稿练习页的「提交」：听力/中译英=提交写的答案，口语=停录评测/下一题 */
function onPracticeSubmit() {
  if (isInputMode.value) {
    onInputSubmit();
    return;
  }
  onOralSubmit();
}

function onInputSubmit() {
  if (!answering.value) {
    next();
    return;
  }
  if (submitting.value) return;
  onAnswerSubmit(listenAnswer.value);
}

function onFinishContinue() {
  finishOpen.value = false;
  paused.value = false;
  gameIndex.value = 0;
  resetItem();
}

function onFinishNext() {
  finishOpen.value = false;
  paused.value = false;
  void leave();
}

function onFinishClose() {
  finishOpen.value = false;
  paused.value = false;
  void leave();
}

function startRecord() {
  stopSpeak();
  oralTranscript.value = "";
  oralHint.value = "";
  releaseOralAudio();
  void startAudioCapture();
  // 手机端语音识别会和 MediaRecorder 抢麦克风（iOS 上会把录音顶掉），评测服务端已经能识别，直接跳过
  if (isPhone.value) {
    recording.value = true;
    return;
  }
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
  // 手机端 getUserMedia 必须有安全来源（https 或 localhost），否则 mediaDevices 直接是 undefined
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    oralHint.value = window.isSecureContext
      ? "当前浏览器不支持录音，请换 Chrome / Safari 再试"
      : "录音需要 https 或 localhost 打开，当前是 http 局域网地址";
    return;
  }
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
  } catch (error) {
    // 麦克风打不开时给出明确原因，不要静默失败（否则用户只会看到"没有录到声音"）
    oralHint.value = micErrorMessage(error);
  }
}

function micErrorMessage(error: unknown) {
  const name = (error as DOMException | null)?.name || "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "麦克风权限被拒绝：请在浏览器设置里允许本站使用麦克风";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "没有检测到可用的麦克风";
  }
  if (name === "NotReadableError") {
    return "麦克风被其它应用占用，请关掉其它录音应用后重试";
  }
  return "无法打开麦克风，请重试";
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
  if (listenWrongTimer) {
    clearTimeout(listenWrongTimer);
    listenWrongTimer = undefined;
  }
  answering.value = true;
  listenAnswer.value = "";
  listenWrong.value = false;
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
  if (isPracticePage.value) {
    await flushHeartbeat();
    finishOpen.value = true;
    paused.value = true;
    return;
  }
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

  // 完成弹窗：空格=继续练习、回车=下一章、Esc=关闭（口语 / 听力共用）
  if (finishOpen.value) {
    if (key === " " || event.code === "Space") {
      event.preventDefault();
      onFinishContinue();
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      onFinishNext();
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      onFinishClose();
    }
    return;
  }

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
      onOralSubmit();
    }
  }
}

function shouldAutoSpeak() {
  if (mode.value === "SentenceListen") return current.value?.settings?.autoPlay !== false;
  if (mode.value === "SentenceOral") return true;
  // 中译英（整句默写）不能自动念英文，否则直接把答案说出来了
  if (isTranslateInput.value) return false;
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
  // 手机端音频解锁：第一次点击/触摸时把 audio 元素激活，之后自动朗读才不会被拦
  document.addEventListener("pointerdown", unlockAudio, { passive: true });
  document.addEventListener("touchstart", unlockAudio, { passive: true });
  document.addEventListener("keydown", unlockAudio);
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
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("touchstart", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
  stopViewport?.();
  if (tick) clearInterval(tick);
  if (autoNextTimer) clearTimeout(autoNextTimer);
  stopRecord();
  stopSpeak();
  releaseOralAudio();
  if (silentSourceUrl) URL.revokeObjectURL(silentSourceUrl);
});
</script>
