<template>
  <div class="gamePage gamePageFixed">
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
      @list="listOpen = true"
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
          v-if="showChinese && mode === 'SentenceTranslate'"
          class="mb50 tc ani size40 gameChinese"
        >
          {{ current.chinese }}
        </div>
        <GameWords
          v-if="mode === 'SentenceTranslate'"
          :key="`${gameIndex}-${current.id}-${mode}`"
          ref="wordsRef"
          :english="current.english"
          :ignore-case="gameSetting.ignore_case"
          :auto-show-times="gameSetting.answer_auto_show_error_times"
          @success="onSuccess"
        />
        <GameListen
          v-else-if="mode === 'SentenceListen'"
          :english="current.english"
          :chinese="current.chinese"
          :phonetic="phonetic"
          :part-of-speech="current.part_of_speech"
          :show-chinese="gameSetting.show_translate"
          @speak-word="speakWord"
        />
        <GameTyping
          v-else-if="mode === 'SentenceTypeing'"
          :key="`${gameIndex}-${current.id}-type`"
          ref="typingRef"
          :english="current.english"
          :chinese="current.chinese"
          :part-of-speech="current.part_of_speech"
          :show-chinese="gameSetting.show_translate"
          :show-letters="gameSetting.typeing_show"
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
      @prev="prev"
      @next="next"
      @speak="speak"
      @record="toggleRecord"
      @submit="wordsRef?.submit()"
      @reveal="wordsRef?.reveal()"
      @toggle-letters="toggleLetters"
      @key="onKeyboard"
    />

    <ModePop ref="modeRef" />

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
    </Teleport>

    <el-drawer v-model="settingOpen" title="设置" size="20rem">
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

    <el-drawer v-model="listOpen" title="学习内容" size="24rem">
      <div
        v-for="(item, index) in gameList"
        :key="item.id"
        class="contentRow"
        :class="{ act: index === gameIndex }"
        @click="jumpTo(index)"
      >
        <div class="size20">{{ index + 1 }}. {{ item.chinese || item.english }}</div>
        <div class="opc6 size-18 mt10">{{ item.english }}</div>
      </div>
    </el-drawer>

    <el-dialog v-model="feedbackOpen" title="报告错误" width="28rem">
      <el-input v-model="feedbackText" type="textarea" :rows="4" placeholder="请输入错误描述" />
      <template #footer>
        <el-button @click="feedbackOpen = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
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
  currentSentence,
  gameBackPath,
  gameIndex,
  gameList,
  gameSession,
  gameSetting,
  gameTime,
  isImmersiveMode,
  saveGameSetting,
} from "@/composables/useGame";
import { isPhone, initLayoutViewport } from "@/composables/useLayout";
import { formatClock, oralMatch } from "@/lib/gameText";

const router = useRouter();
const session = computed(() => gameSession.value);
const current = computed(() => currentSentence.value);
const mode = computed(() => session.value?.gameMode || "SentenceTranslate");
const answering = ref(true);
const pauseOpen = ref(false);
const leaveOpen = ref(false);
const resetOpen = ref(false);
const settingOpen = ref(false);
const listOpen = ref(false);
const feedbackOpen = ref(false);
const feedbackText = ref("");
const swing = ref(false);
const paused = ref(false);
const elapsed = ref(gameTime.value || 0);
const wordsRef = ref<{ submit: () => void; reveal: () => void; injectKey: (key: string) => void } | null>(null);
const typingRef = ref<{ typeKey: (key: string) => void } | null>(null);
const modeRef = ref<{ open: () => void } | null>(null);
const playing = ref(false);
const recording = ref(false);
const evaluating = ref(false);
const oralCompleted = ref(false);
const oralTranscript = ref("");
const oralHint = ref("");
const oralAudioBlob = ref<Blob | null>(null);
const oralAudioUrl = ref("");
const nextKey = ref("");
const errorKey = ref("");
const activeKey = ref("");
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

const isDesktop = computed(() => !isPhone.value);
const clock = computed(() => formatClock(elapsed.value));
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
  stopSpeak();
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
  next();
}

function getRecognizer(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

function toggleRecord() {
  if (oralCompleted.value && !answering.value) {
    resetItem();
    startRecord();
    return;
  }
  if (recording.value) {
    stopRecord();
    if (!getRecognizer()) {
      evaluating.value = true;
      window.setTimeout(() => {
        evaluating.value = false;
        onSuccess();
      }, 400);
    }
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
      checkOral(result);
    }
  };
  rec.onerror = () => {
    oralHint.value = "没有听清，请再录一次";
    recording.value = false;
  };
  rec.onend = () => {
    recording.value = false;
    stopAudioCapture();
    if (oralTranscript.value && answering.value) {
      checkOral(oralTranscript.value);
    }
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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (token !== captureToken) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    mediaStream = stream;
    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
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
  } catch {
    /* 未授权麦克风时退化为仅语音识别转写 */
  }
}

function stopAudioCapture() {
  captureToken += 1;
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

function checkOral(text: string) {
  if (!current.value || !answering.value) return;
  if (oralMatch(text, current.value.english)) {
    oralHint.value = "";
    onSuccess();
    return;
  }
  oralHint.value = "请再录一次";
}

function onSuccess() {
  answering.value = false;
  recording.value = false;
  evaluating.value = false;
  if (mode.value === "SentenceOral") oralCompleted.value = true;
  if (gameSetting.value.success_auto_next) {
    autoNextTimer = window.setTimeout(() => next(), 300);
  }
}

function resetItem() {
  answering.value = true;
  oralTranscript.value = "";
  oralHint.value = "";
  oralCompleted.value = false;
  evaluating.value = false;
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

function jumpTo(index: number) {
  gameIndex.value = index;
  listOpen.value = false;
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
  paused.value = false;
}

async function leave() {
  pauseOpen.value = false;
  leaveOpen.value = false;
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
    if (key === " " || event.code === "Space") {
      event.preventDefault();
      next();
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

watch(
  () => [gameIndex.value, mode.value],
  () => {
    if (gameSetting.value.speaker_read_auto || mode.value === "SentenceListen" || mode.value === "SentenceOral") {
      window.setTimeout(() => speak(), 300);
    }
  },
);

onMounted(() => {
  stopViewport = initLayoutViewport();
  window.addEventListener("keydown", onShortcut);
  if (!session.value?.chapterId || !gameList.value.length) {
    ElMessage.warning("请先选择课程");
    void router.replace(gameBackPath(session.value));
    return;
  }
  elapsed.value = gameTime.value || 0;
  tick = window.setInterval(() => {
    if (paused.value) return;
    elapsed.value += 1;
    if (elapsed.value > 0 && elapsed.value % 60 === 0) {
      swing.value = true;
      window.setTimeout(() => {
        swing.value = false;
      }, 1000);
    }
  }, 1000);
  if (gameSetting.value.speaker_read_auto || mode.value === "SentenceListen" || mode.value === "SentenceOral") {
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