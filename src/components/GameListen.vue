<template>
  <div class="flex1 flex col jc ac gameListen">
    <div class="mb40 tc size40 listenHint">{{ chinese }}</div>
    <div v-if="phoneticHint" class="opc6 mb20 tc size24">{{ phoneticHint }}</div>
    <el-input
      v-model="answer"
      class="listenAnswer"
      size="large"
      :placeholder="placeholder"
      clearable
      @keydown.enter.prevent="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  chinese: string;
  phoneticHint?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  submit: [answer: string];
}>();

const answer = ref("");

function submit() {
  emit("submit", answer.value);
}

function getAnswer() {
  return answer.value;
}

watch(
  () => props.chinese,
  () => {
    answer.value = "";
  },
);

defineExpose({ submit, getAnswer });
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
.listenAnswer :deep(.el-input__inner) {
  height: 2.5rem;
  text-align: center;
  font-size: 1.25rem;
}
</style>
