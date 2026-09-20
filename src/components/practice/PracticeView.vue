<template>
  <div class="practicePage flex col">
    <img class="practiceBgLeft" src="/clone-assets/practice/bg-left.png" alt="" aria-hidden="true" />
    <img class="practiceBgRight" src="/clone-assets/practice/bg-right.png" alt="" aria-hidden="true" />

    <header class="practiceHead flex jb ac">
      <div class="practiceHeadLeft flex ac minw0">
        <button type="button" class="practiceLogo flex0 hand" aria-label="返回课程详情" @click="emit('exit')">
          <img src="/clone-assets/home/logo-englishgo.png" alt="Englishgo" />
        </button>
        <!-- 设计稿：面包屑换成「‹ 返回」 -->
        <button type="button" class="practiceBack flex ac hand" aria-label="返回" @click="emit('exit')">
          <svg class="practiceBackIcon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 3.5 8 12l7 8.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>返回</span>
        </button>
      </div>
      <UserDropdown />
    </header>

    <div class="practiceBody flex col ac">
      <div class="practiceLesson line1">{{ title }}</div>

      <section class="practiceCard flex col ac">
        <div class="practiceStrip flex ac jc">
          <div class="practiceMode flex ac">
            <img class="practiceModeIcon" :src="modeIcon" alt="" />
            <span class="practiceModeText">{{ modeLabel }}</span>
          </div>
          <div class="practiceTimer">{{ clock }}</div>
          <el-dropdown trigger="click" placement="bottom" @command="onSpeed">
            <button type="button" class="practiceSpeed flex ac hand" aria-label="播放速度">
              <img class="practiceSpeedIcon" src="/clone-assets/practice/icon-speed.png" alt="" />
              <span class="practiceSpeedText">{{ speedText }}</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in speedOptions" :key="item" :command="item">
                  {{ formatSpeed(item) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="practiceMeter flex col ac">
          <div class="practiceMeterTip">{{ index + 1 }}/{{ total || 1 }}</div>
          <div
            class="practiceMeterBar"
            role="progressbar"
            :aria-valuenow="index + 1"
            aria-valuemin="1"
            :aria-valuemax="total || 1"
          >
            <div class="practiceMeterFill" :style="{ width: `${percent}%` }" />
          </div>
        </div>

        <!-- 口语模式：句子 + 播放 + 麦克风 -->
        <template v-if="!isInput">
          <div class="practiceAsk">{{ oralAsk }}</div>
          <div class="practiceSentence">{{ english }}</div>
          <div v-if="showChinese && chinese" class="practiceChinese">{{ chinese }}</div>

          <button type="button" class="practicePlay flex ac hand" @click="emit('speak')">
            <img class="practicePlayIcon" src="/clone-assets/practice/icon-play.png" alt="" />
            <span class="practicePlayText">{{ playing ? "播放中..." : "点击播放" }}</span>
          </button>

          <div class="practiceMicWrap flex col ac">
            <button
              type="button"
              class="practiceMic"
              :class="{ 'is-recording': recording, 'is-eval': evaluating }"
              :aria-label="recording ? '结束录音' : '开始录音'"
              @click="onMicClick"
              @contextmenu.prevent
            >
              <img src="/clone-assets/practice/mic.png" alt="" />
            </button>
            <div
              class="practiceHint"
              :class="hintTone === 'ok' ? 'is-ok' : hintTone === 'bad' ? 'is-error' : ''"
            >
              {{ micHint }}
            </div>
          </div>
        </template>

        <!-- 听力 / 中译英 / 打字练习：题目 + 输入框 -->
        <template v-else>
          <div class="practiceAsk inputAsk">{{ inputAsk }}</div>
          <template v-if="isTyping">
            <div class="practiceSentence typingSentence">{{ english }}</div>
            <div v-if="showChinese && chinese" class="practiceChinese">{{ chinese }}</div>
            <button
              type="button"
              class="practicePlay practicePlayTyping flex ac hand"
              @click="emit('speak')"
            >
              <img class="practicePlayIcon" src="/clone-assets/practice/icon-play.png" alt="" />
              <span class="practicePlayText">{{ playing ? "播放中..." : "朗读" }}</span>
            </button>
          </template>
          <div v-else-if="isTranslate" class="practiceTranslate">{{ chinese }}</div>
          <button
            v-else
            type="button"
            class="practiceSpeaker hand"
            :class="{ 'is-playing': playing }"
            aria-label="播放音频"
            @click="emit('speak')"
          >
            <img src="/clone-assets/practice/speaker.png" alt="" />
          </button>
          <input
            ref="inputRef"
            class="listenInput"
            :class="{
              translateInput: isTranslate,
              typingInput: isTyping,
              'is-error': answerError,
              'is-ok': answerOk,
              'animate__animated': true,
              'animate__headShake': answerError,
            }"
            :value="answer"
            type="text"
            :placeholder="inputPlaceholder"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            @input="onInput"
            @keydown.enter.prevent.stop="emit('submit')"
          />
          <div
            class="listenHint"
            :class="listenHintTone === 'ok' ? 'is-ok' : listenHintTone === 'bad' ? 'is-error' : ''"
          >
            {{ listenHint }}
          </div>
        </template>

        <div class="practiceActions flex ac">
          <button
            type="button"
            class="practiceBtn"
            :class="{ 'is-disabled': !canPrev }"
            :disabled="!canPrev"
            @click="emit('prev')"
          >
            <img class="practiceBtnIcon" src="/clone-assets/practice/icon-prev.png" alt="" />
            <span>上一题</span>
          </button>
          <button
            type="button"
            class="practiceBtn practiceBtnPrimary"
            :class="{ 'is-disabled': evaluating || submitting }"
            :disabled="evaluating || submitting"
            @click="emit('submit')"
          >
            <span>提交</span>
          </button>
          <button type="button" class="practiceBtn" @click="emit('next')">
            <span>下一题</span>
            <img class="practiceBtnIcon" src="/clone-assets/practice/icon-arrow-right.png" alt="" />
          </button>
        </div>
      </section>
    </div>

    <PracticeFinishDialog
      v-if="finishVisible"
      :duration="finishDuration"
      :count="finishCount"
      @continue="emit('finishContinue')"
      @next="emit('finishNext')"
      @close="emit('finishClose')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import UserDropdown from "@/components/UserDropdown.vue";
import PracticeFinishDialog from "@/components/practice/PracticeFinishDialog.vue";

const props = defineProps<{
  /**
   * oral=口语练习（朗读+录音），listen=听力练习（听音+默写），
   * translate=中译英（看中文+写英文），typing=打字练习（照着英文逐字母输入）
   */
  mode?: "oral" | "listen" | "translate" | "typing";
  title: string;
  clock: string;
  speed: number;
  index: number;
  total: number;
  english: string;
  chinese: string;
  showChinese: boolean;
  playing: boolean;
  recording: boolean;
  evaluating: boolean;
  submitting?: boolean;
  hint: string;
  result: string;
  resultTone: "" | "ok" | "bad";
  canPrev: boolean;
  // 听力模式
  answer?: string;
  answerError?: boolean;
  answerOk?: boolean;
  listenHint?: string;
  listenHintTone?: "" | "ok" | "bad";
  finishVisible: boolean;
  finishDuration: string;
  finishCount: number;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  submit: [];
  speak: [];
  exit: [];
  speed: [value: number];
  recordStart: [];
  recordStop: [];
  "update:answer": [value: string];
  finishContinue: [];
  finishNext: [];
  finishClose: [];
}>();

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5];
const SPEED_TEXT: Record<string, string> = {
  "0.5": "0.5x",
  "0.75": "0.75x",
  "1": "1.0x",
  "1.25": "1.25x",
  "1.5": "1.5x",
};

const isListen = computed(() => props.mode === "listen");
const isTranslate = computed(() => props.mode === "translate");
const isTyping = computed(() => props.mode === "typing");
const isInput = computed(() => isListen.value || isTranslate.value || isTyping.value);
const modeLabel = computed(() =>
  isTyping.value
    ? "打字练习"
    : isTranslate.value
      ? "中译英"
      : isListen.value
        ? "听力练习"
        : "口语练习",
);
const modeIcon = computed(() =>
  isTyping.value
    ? "/clone-assets/practice/icon-typing.svg"
    : isTranslate.value
      ? "/clone-assets/practice/icon-translate.png"
      : isListen.value
        ? "/clone-assets/practice/icon-listen.png"
        : "/clone-assets/practice/icon-oral.png",
);
const oralAsk = "请大声朗读以下英语句子";
const listenAsk = "听力模式一听音频，写出你听到的英文：";
const translateAsk = "中译英练习——看中文，写出英文：";
const typingAsk = "打字练习-照着下面的英文逐字母输入：";
const inputAsk = computed(() =>
  isTyping.value ? typingAsk : isTranslate.value ? translateAsk : listenAsk,
);
const inputPlaceholder = computed(() =>
  isTyping.value
    ? "在此照打上面的英文句子..."
    : isTranslate.value
      ? "Write the English translation..."
      : "Type what you hear...",
);

const inputRef = ref<HTMLInputElement>();
const percent = computed(() => {
  const total = Number(props.total) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.round(((props.index + 1) / total) * 1000) / 10);
});

function formatSpeed(value: number) {
  return SPEED_TEXT[String(value)] || `${value}x`;
}

const speedText = computed(() => formatSpeed(props.speed || 1));

const micHint = computed(() => {
  if (props.evaluating) return "评测中…";
  if (props.recording) return "录音中，点击结束";
  if (props.result) return props.result;
  return props.hint || "点击麦克风开始录音";
});

const hintTone = computed(() => {
  if (props.recording || props.evaluating) return "";
  if (props.result) return props.resultTone;
  return props.hint ? "bad" : "";
});

function focusInput() {
  nextTick(() => inputRef.value?.focus());
}

watch(
  () => [props.index, props.english, props.mode],
  () => {
    if (isInput.value) focusInput();
  },
);

onMounted(() => {
  if (isInput.value) focusInput();
});

function onInput(event: Event) {
  emit("update:answer", (event.target as HTMLInputElement).value);
}

function onSpeed(value: number | string) {
  emit("speed", Number(value));
}

/**
 * 口语录音：点一次开始，一直录；再点一次结束并送评测。
 * 录音状态由父级（GamePage）维护，这里只发事件，避免两边状态打架。
 */
function onMicClick() {
  if (props.evaluating) return;
  if (props.recording) {
    emit("recordStop");
    return;
  }
  emit("recordStart");
}

defineExpose({ focusInput });
</script>
