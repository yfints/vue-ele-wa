<template>
  <div class="flex wrap jc ac gameWords">
    <div
      v-for="(item, index) in tokens"
      :key="item.id"
      class="item ani size70"
      @click="focusWord(index)"
    >
      <div
        v-if="item.isWord"
        class="itemWord"
        :class="{ animate__animated: true, animate__headShake: item.shake }"
        :style="wordStyle(item, index)"
      >
        <span class="itemPlaceholder" aria-hidden="true">{{ placeholderText(item) }}</span>
        <span class="itemAnswer">{{ item.answer }}</span>
      </div>
      <div v-else class="itemPunct">{{ item.word }}</div>
    </div>
  </div>
  <Teleport to="body">
    <input
      ref="hiddenInput"
      v-model="draft"
      class="visibilityInput"
      type="email"
      lang="en"
      inputmode="email"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      placeholder="隐藏输入框"
      @blur="onBlur"
      @input="onInput"
      @keydown="onKeydown"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { tokenize } from "@/lib/gameText";

interface WordToken {
  id: number;
  word: string;
  isWord: boolean;
  answer: string;
  errorCount: number;
  shake: boolean;
}

const props = defineProps<{
  english: string;
  ignoreCase: boolean;
  autoShowTimes: number;
}>();

const emit = defineEmits<{
  success: [];
  error: [];
  submit: [answer: string];
}>();

const tokens = ref<WordToken[]>([]);
const currentIndex = ref(-1);
const draft = ref("");
const hiddenInput = ref<HTMLInputElement | null>(null);
const missRound = ref(0);

function rebuild() {
  tokens.value = tokenize(props.english).map((item, index) => ({
    id: Date.now() + index,
    word: item.word,
    isWord: item.isWord,
    answer: "",
    errorCount: 0,
    shake: false,
  }));
  missRound.value = 0;
  draft.value = "";
  nextTick(() => focusFirst());
}

function firstWord() {
  return tokens.value.findIndex((item) => item.isWord);
}

function lastWord() {
  for (let i = tokens.value.length - 1; i >= 0; i--) {
    if (tokens.value[i].isWord) return i;
  }
  return -1;
}

function prevWord(from: number) {
  for (let i = from - 1; i >= 0; i--) {
    if (tokens.value[i].isWord) return i;
  }
  return lastWord();
}

function nextWord(from: number) {
  for (let i = from + 1; i < tokens.value.length; i++) {
    if (tokens.value[i].isWord) return i;
  }
  return firstWord();
}

function focusWord(index: number) {
  if (!tokens.value[index]?.isWord) return;
  currentIndex.value = index;
  draft.value = tokens.value[index].answer;
  nextTick(() => hiddenInput.value?.focus());
}

function focusFirst() {
  const index = firstWord();
  if (index >= 0) focusWord(index);
}

function placeholderText(item: WordToken) {
  const target = item.word;
  const answer = item.answer;
  return answer.length < target.length ? answer + target.slice(answer.length) : answer || target;
}

function wordStyle(item: WordToken, index: number) {
  const current = currentIndex.value === index;
  const color = item.errorCount === 0 ? "var(--game-font-color)" : "#E62129";
  let border = "#888888";
  if (current) border = item.errorCount > 0 ? "#E62129" : item.answer ? color : "#247DFF";
  else if (item.errorCount > 0) border = "#E62129";
  return {
    borderBottomColor: border,
    color,
  };
}

function onBlur() {
  currentIndex.value = -1;
}

function onInput(event: Event) {
  const index = currentIndex.value;
  if (index < 0) return;
  const native = event as InputEvent;
  if (native.inputType?.startsWith("delete")) {
    tokens.value[index].answer = draft.value.replace(/\s/g, "");
    return;
  }
  if (native.data && native.data.trim() === "") {
    onSpace();
    return;
  }
  const value = draft.value.replace(/\s/g, "");
  if (tokens.value[index].errorCount > 0) {
    tokens.value[index].errorCount = 0;
    tokens.value[index].answer = value.slice(-1);
    draft.value = tokens.value[index].answer;
  } else {
    tokens.value[index].answer = value;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    submit();
    return;
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    reveal();
    return;
  }
  if (event.key === "Backspace" && !draft.value) {
    event.preventDefault();
    goPrev();
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goPrev();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goNext();
  }
}

function goPrev() {
  if (currentIndex.value >= 0) focusWord(prevWord(currentIndex.value));
}

function goNext() {
  if (currentIndex.value >= 0) focusWord(nextWord(currentIndex.value));
}

function onSpace() {
  const pending = tokens.value.some((item) => item.isWord && (!item.answer || item.errorCount > 0));
  if (pending) goNext();
  else submit();
}

function getAnswer() {
  return tokens.value.filter((item) => item.isWord).map((item) => item.answer).join("|");
}

function submit() {
  const answer = getAnswer();
  if (!answer.replace(/\|/g, "").trim()) {
    emit("error");
    return;
  }
  emit("submit", answer);
}

function reveal() {
  tokens.value.forEach((item) => {
    if (item.isWord) item.answer = item.word;
  });
  emit("submit", getAnswer());
}

function injectKey(key: string) {
  if (currentIndex.value < 0) focusFirst();
  const index = currentIndex.value;
  if (index < 0) return;
  if (key === "Enter") {
    submit();
    return;
  }
  if (key === " ") {
    onSpace();
    return;
  }
  if (key === "Backspace") {
    const next = (tokens.value[index].answer || "").slice(0, -1);
    tokens.value[index].answer = next;
    tokens.value[index].errorCount = 0;
    draft.value = next;
    if (!next) goPrev();
    return;
  }
  if (key.length !== 1) return;
  const item = tokens.value[index];
  if (item.errorCount > 0) {
    item.errorCount = 0;
    item.answer = key;
  } else {
    item.answer = `${item.answer || ""}${key}`.replace(/\s/g, "");
  }
  draft.value = item.answer;
}

defineExpose({ submit, reveal, focusFirst, injectKey, getAnswer });

watch(() => props.english, rebuild, { immediate: true });

onMounted(() => {
  window.addEventListener("keydown", onWindowEnter);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onWindowEnter);
});

function onWindowEnter(event: KeyboardEvent) {
  if (event.key === "Enter" && currentIndex.value < 0) submit();
}

</script>
