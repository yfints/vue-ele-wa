<template>
  <div class="botbar flex col jc ac size-22" :class="{ 'botbar--immersive': immersive }">
    <GameKeyboard
      v-if="mode === 'SentenceTypeing'"
      :next-key="nextKey"
      :error-key="errorKey"
      :active-key="activeKey"
      @key="emit('key', $event)"
    />
    <GameWave v-if="showWave" :active="playing || recording" />
    <div class="botboxWrap">
      <div class="mt10 botbox flex wrap jc ac animate__animated animate__zoomIn ani5">
        <div class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" :class="{ opc6: disabledPrev }" @click="emit('prev')">
            <el-icon class="img25"><ArrowLeft /></el-icon>
            <span class="bold6 ml10">上一题</span>
          </div>
        </div>

        <div v-if="mode === 'SentenceTranslate' && translateType !== 1 && answering" class="pl10 pr10 pb10">
          <div class="botitem flex ac">
            <span class="bold6 mr10">空格 / ←→</span>
            <span class="opc6">跳格</span>
          </div>
        </div>
        <div v-else-if="mode === 'SentenceTranslate' && translateType !== 1 && !answering" class="pl10 pr10 pb10">
          <div class="botitem flex ac">
            <span class="bold6 mr10">←→</span>
            <span class="opc6">朗读</span>
          </div>
        </div>
        <div v-else-if="mode === 'SentenceListen' || (mode === 'SentenceTranslate' && translateType === 1)" class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="onTranslateSpace">
            <span class="bold6 mr10">空格 / Enter</span>
            <span :class="answering ? '' : 'opc6'">{{ answering ? "提交" : "下一题" }}</span>
          </div>
        </div>

        <div class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="emit('speak')">
            <span class="bold6 mr10">V</span>
            <span class="opc6">朗读</span>
          </div>
        </div>

        <div v-if="mode === 'SentenceTranslate' && translateType !== 1" class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="onTranslateSpace">
            <span class="bold6 mr10">空格</span>
            <span :class="answering ? '' : 'opc6'">{{ answering ? "提交" : "下一题" }}</span>
          </div>
        </div>
        <div v-if="mode === 'SentenceTranslate' && translateType !== 1 && answering" class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="emit('reveal')">
            <span class="bold6 mr10">↓ ↑</span>
            <span class="opc6">答案</span>
          </div>
        </div>

        <div v-if="mode === 'SentenceTypeing'" class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="emit('toggleLetters')">
            <span class="bold6 mr10">空格</span>
            <span class="opc6">{{ showLetters ? "隐藏" : "显示" }}答案</span>
          </div>
        </div>

        <div v-if="mode === 'SentenceOral'" class="pl10 pr10 pb10">
          <div class="botitem flex ac" :class="oralDisabled ? 'opc6' : 'hand'" @click="onRecord">
            <span class="bold6 mr10">空格</span>
            <span class="opc6">{{ oralAction }}</span>
          </div>
        </div>

        <div class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="emit('next')">
            <span class="bold6 mr10">Shift</span>
            <span class="bold6 mr10">{{ mode === 'SentenceOral' ? '←→ / Enter' : mode === 'SentenceListen' ? '←→ / 空格' : '←→' }}</span>
            <span class="opc6">切题</span>
          </div>
        </div>

        <div class="pl10 pr10 pb10">
          <div class="botitem flex ac hand" @click="emit('next')">
            <span class="bold6 mr10">下一题</span>
            <el-icon class="img25"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import type { GameMode } from "@/composables/useGame";
import GameKeyboard from "@/components/GameKeyboard.vue";
import GameWave from "@/components/GameWave.vue";

const props = defineProps<{
  mode: GameMode;
  immersive: boolean;
  disabledPrev: boolean;
  playing: boolean;
  recording: boolean;
  completed: boolean;
  retryable?: boolean;
  answering: boolean;
  showLetters: boolean;
  nextKey: string;
  errorKey: string;
  activeKey: string;
  translateType?: number;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  speak: [];
  record: [];
  submit: [];
  reveal: [];
  toggleLetters: [];
  key: [value: string];
}>();

const showWave = computed(
  () => props.mode === "SentenceListen" || props.mode === "SentenceOral" || props.playing,
);
/** 已判分且不允许重录时，口语那项变成不可点的「已提交」 */
const oralDisabled = computed(() => props.completed && !props.retryable);
const oralAction = computed(() => {
  if (props.completed) return props.retryable ? "重录" : "已提交";
  if (props.recording) return "结束";
  return "录制";
});

function onRecord() {
  if (oralDisabled.value) return;
  emit("record");
}

function onTranslateSpace() {
  if (props.answering) emit("submit");
  else emit("next");
}
</script>
