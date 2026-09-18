<template>
  <div class="oralPage flex col">
    <img class="oralBgLeft" src="/clone-assets/oral/bg-left.png" alt="" aria-hidden="true" />
    <img class="oralBgRight" src="/clone-assets/oral/bg-right.png" alt="" aria-hidden="true" />

    <header class="oralHead flex jb ac">
      <div class="oralHeadLeft flex ac minw0">
        <button type="button" class="oralLogo flex0 hand" aria-label="返回课程详情" @click="emit('exit')">
          <img src="/clone-assets/home/logo-englishgo.png" alt="Englishgo" />
        </button>
        <nav class="oralCrumbs flex ac minw0" aria-label="面包屑">
          <RouterLink to="/home/index" class="oralCrumb">首页</RouterLink>
          <img class="oralCrumbSep" src="/clone-assets/oral/icon-next.png" alt="" />
          <span class="oralCrumbCur line1 hand" @click="emit('exit')">{{ crumb }}</span>
        </nav>
      </div>
      <UserDropdown />
    </header>

    <div class="oralBody flex col ac">
      <div class="oralLesson line1">{{ title }}</div>

      <section class="oralCard flex col ac">
        <div class="oralStrip flex ac jc">
          <div class="oralMode flex ac">
            <img class="oralModeIcon" src="/clone-assets/oral/icon-oral.png" alt="" />
            <span class="oralModeText">口语练习</span>
          </div>
          <div class="oralTimer">{{ clock }}</div>
          <el-dropdown trigger="click" placement="bottom" @command="onSpeed">
            <button type="button" class="oralSpeed flex ac hand" aria-label="播放速度">
              <img class="oralSpeedIcon" src="/clone-assets/oral/icon-speed.png" alt="" />
              <span class="oralSpeedText">{{ speedText }}</span>
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

        <div class="oralMeter flex col ac">
          <div class="oralMeterTip">{{ index + 1 }}/{{ total || 1 }}</div>
          <div class="oralMeterBar" role="progressbar" :aria-valuenow="index + 1" aria-valuemin="1" :aria-valuemax="total || 1">
            <div class="oralMeterFill" :style="{ width: `${percent}%` }" />
          </div>
        </div>

        <div class="oralAsk">{{ ask }}</div>
        <div class="oralSentence">{{ english }}</div>
        <div v-if="showChinese && chinese" class="oralChinese">{{ chinese }}</div>

        <button type="button" class="oralPlay flex ac hand" @click="emit('speak')">
          <img class="oralPlayIcon" src="/clone-assets/oral/icon-speaker.png" alt="" />
          <span class="oralPlayText">{{ playing ? "播放中..." : "点击播放" }}</span>
        </button>

        <div class="oralMicWrap flex col ac">
          <button
            type="button"
            class="oralMic"
            :class="{ 'is-recording': recording, 'is-eval': evaluating }"
            aria-label="按住麦克风开始录音"
            @pointerdown="onMicDown"
            @pointerup="onMicUp"
            @pointercancel="onMicUp"
            @pointerleave="onMicUp"
            @contextmenu.prevent
          >
            <img src="/clone-assets/oral/mic.png" alt="" />
          </button>
          <div class="oralMicHint" :class="micHintTone === 'ok' ? 'is-ok' : micHintTone === 'bad' ? 'is-error' : ''">
            {{ micHint }}
          </div>
        </div>

        <div class="oralActions flex ac">
          <button
            type="button"
            class="oralBtn"
            :class="{ 'is-disabled': !canPrev }"
            :disabled="!canPrev"
            @click="emit('prev')"
          >
            <img class="oralBtnIcon" src="/clone-assets/oral/icon-prev.png" alt="" />
            <span>上一题</span>
          </button>
          <button
            type="button"
            class="oralBtn oralBtnPrimary"
            :class="{ 'is-disabled': evaluating }"
            :disabled="evaluating"
            @click="emit('submit')"
          >
            <span>提交</span>
          </button>
          <button type="button" class="oralBtn" @click="emit('next')">
            <span>下一题</span>
            <img class="oralBtnIcon" src="/clone-assets/oral/icon-arrow-right.png" alt="" />
          </button>
        </div>
      </section>
    </div>

    <OralFinishDialog
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
import { computed, watch } from "vue";
import { RouterLink } from "vue-router";
import UserDropdown from "@/components/UserDropdown.vue";
import OralFinishDialog from "@/components/oral/OralFinishDialog.vue";

const props = defineProps<{
  title: string;
  crumb: string;
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
  hint: string;
  result: string;
  resultTone: "" | "ok" | "bad";
  canPrev: boolean;
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

const percent = computed(() => {
  const total = Number(props.total) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.round(((props.index + 1) / total) * 1000) / 10);
});

const ask = "请大声朗读以下英语句子";

function formatSpeed(value: number) {
  return SPEED_TEXT[String(value)] || `${value}x`;
}

const speedText = computed(() => formatSpeed(props.speed || 1));

const micHint = computed(() => {
  if (props.evaluating) return "评测中…";
  if (props.recording) return "松手结束录音";
  if (props.result) return props.result;
  return props.hint || "按住麦克风开始录音";
});

const micHintTone = computed(() => {
  if (props.recording || props.evaluating) return "";
  if (props.result) return props.resultTone;
  return props.hint ? "bad" : "";
});

function onSpeed(value: number | string) {
  emit("speed", Number(value));
}

/**
 * 按住录音：按下开录、松手结束并评测。
 * 快速点一下（< 250ms）时改成「点一下开始、再点一下结束」，避免误触录到空音频。
 */
let pressAt = 0;
let holding = false;
let latched = false;

function onMicDown() {
  if (props.evaluating) return;
  if (latched) {
    latched = false;
    emit("recordStop");
    return;
  }
  if (holding || props.recording) return;
  holding = true;
  pressAt = Date.now();
  emit("recordStart");
}

function onMicUp() {
  if (!holding) return;
  holding = false;
  if (Date.now() - pressAt < 250) {
    latched = true;
    return;
  }
  emit("recordStop");
}

watch(
  () => props.recording,
  (value) => {
    if (!value) {
      holding = false;
      latched = false;
    }
  },
);
</script>
