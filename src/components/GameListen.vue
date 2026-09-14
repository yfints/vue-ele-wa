<template>
  <div class="flex1 flex col jc ac gameListen">
    <div class="mb40 tc size40 listenHint">{{ chinese }}</div>
    <div v-if="phoneticHint" class="opc6 mb20 tc size24">{{ phoneticHint }}</div>
    <el-input
      ref="inputRef"
      v-model="answer"
      class="listenAnswer animate__animated"
      :class="{ animate__headShake: shake, fail }"
      size="large"
      :placeholder="placeholder"
      :disabled="locked"
      @keydown.enter.prevent="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import type { InputInstance } from "element-plus";

const props = defineProps<{
  chinese: string;
  phoneticHint?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  submit: [answer: string];
}>();

const answer = ref("");
const shake = ref(false);
const fail = ref(false);
const locked = ref(false);
const inputRef = ref<InputInstance>();
let wrongTimer: number | undefined;

function focus() {
  nextTick(() => inputRef.value?.focus());
}

function submit() {
  if (locked.value) return;
  emit("submit", answer.value);
}

function getAnswer() {
  return answer.value;
}

function markWrong() {
  if (locked.value) return;
  locked.value = true;
  fail.value = true;
  shake.value = true;
  if (wrongTimer) clearTimeout(wrongTimer);
  wrongTimer = window.setTimeout(() => {
    answer.value = "";
    shake.value = false;
    fail.value = false;
    locked.value = false;
    focus();
  }, 300);
}

watch(
  () => props.chinese,
  () => {
    answer.value = "";
    shake.value = false;
    fail.value = false;
    locked.value = false;
    if (wrongTimer) clearTimeout(wrongTimer);
    focus();
  },
);

onMounted(() => focus());

defineExpose({ submit, getAnswer, markWrong, focus });
</script>

<style scoped>
.gameListen {
  width: min(51.78571rem, 92vw);
}
.listenHint {
  max-width: 48.21429rem;
  line-height: 1.5;
}
.listenAnswer {
  width: min(40rem, 90vw);
}
.listenAnswer :deep(.el-input__wrapper) {
  min-height: 3rem;
  padding: 0;
  font-size: 1.25rem;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  border-bottom: 0.21429rem solid #888;
}
.listenAnswer :deep(.el-input__wrapper.is-focus) {
  box-shadow: none;
  border-bottom-color: #247dff;
}
.listenAnswer.fail :deep(.el-input__wrapper),
.listenAnswer.fail :deep(.el-input__wrapper.is-focus) {
  border-bottom-color: #e62129;
}
.listenAnswer.fail :deep(.el-input__inner) {
  color: #e62129;
}
.listenAnswer :deep(.el-input__inner) {
  height: 2.5rem;
  text-align: center;
  font-size: 1.25rem;
}
</style>
