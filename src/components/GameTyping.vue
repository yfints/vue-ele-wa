<template>
  <div class="flex1 flex col jc ac gameTyping">
    <div class="flex wrap jc ac bold size70">
      <template v-for="(group, gIndex) in groups" :key="gIndex">
        <div v-if="group.isSpace" class="rel">
          <div class="pl5 pr5">&nbsp;</div>
          <div class="lineGap" />
        </div>
        <div v-else class="wordGroup">
          <div
            v-for="(ch, cIndex) in group.chars"
            :key="`${gIndex}-${cIndex}`"
            class="rel hand"
            @click="speakWord(group)"
          >
            <div
              class="wordItem"
              :class="{
                gameHighLight: ch.answerStatus === 1,
                red: ch.answerStatus === 2,
                opc6: ch.answerStatus === 0,
                fontGlass: shouldGlass(ch),
              }"
            >
              {{ ch.word }}
            </div>
            <div v-if="ch.isWord && current === ch.cur" class="line" />
            <div v-else class="lineGap" />
          </div>
        </div>
      </template>
    </div>
    <div v-if="partOfSpeech" class="opc6 noBr tc mt30 size30">{{ partOfSpeech }}</div>
    <div v-if="showChinese && chinese" class="mt30 tc size40">{{ chinese }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

interface TypeChar {
  word: string;
  isWord: boolean;
  cur: number;
  answerStatus: 0 | 1 | 2;
}

interface TypeGroup {
  isSpace: boolean;
  chars: TypeChar[];
}

const props = defineProps<{
  english: string;
  chinese: string;
  partOfSpeech?: string;
  showChinese: boolean;
  showLetters: boolean;
}>();

const emit = defineEmits<{
  success: [];
  nextKey: [key: string];
  errorKey: [key: string];
  speakWord: [word: string];
}>();

const groups = ref<TypeGroup[]>([]);
const letters = ref<TypeChar[]>([]);
const current = ref(0);
const done = ref(false);

function rebuild() {
  const nextGroups: TypeGroup[] = [];
  const nextLetters: TypeChar[] = [];
  let cursor = 0;
  const words = String(props.english || "").split(" ");
  words.forEach((word, index) => {
    if (word.length) {
      const chars = word.split("").map((ch) => {
        const isWord = /^[a-zA-Z]$/.test(ch);
        const item: TypeChar = {
          word: ch,
          isWord,
          cur: isWord ? cursor++ : -1,
          answerStatus: 0,
        };
        if (isWord) nextLetters.push(item);
        return item;
      });
      nextGroups.push({ isSpace: false, chars });
    }
    if (index < words.length - 1) nextGroups.push({ isSpace: true, chars: [] });
  });
  groups.value = nextGroups;
  letters.value = nextLetters;
  current.value = 0;
  done.value = false;
  emitNext();
}

function emitNext() {
  const item = letters.value[current.value];
  emit("nextKey", item ? item.word.toLowerCase() : "");
}

function shouldGlass(ch: TypeChar) {
  if (props.showLetters) return false;
  if (!ch.isWord) return true;
  if (ch.answerStatus === 1) return false;
  return current.value <= ch.cur;
}

function speakWord(group: TypeGroup) {
  if (group.isSpace) return;
  emit("speakWord", group.chars.map((item) => item.word).join(""));
}

function typeKey(raw: string) {
  if (done.value) return;
  if (/^[a-zA-Z]$/.test(raw)) {
    const item = letters.value[current.value];
    if (!item) return;
    if (item.word.toUpperCase() === raw.toUpperCase()) {
      item.answerStatus = 1;
      if (current.value + 1 >= letters.value.length) {
        done.value = true;
        emit("nextKey", "");
        window.setTimeout(() => emit("success"), 300);
      } else {
        current.value += 1;
        emitNext();
      }
    } else {
      item.answerStatus = 2;
      emit("errorKey", raw.toUpperCase());
    }
    return;
  }
  if (raw === "Backspace" && current.value > 0) {
    const here = letters.value[current.value];
    if (here) here.answerStatus = 0;
    current.value -= 1;
    const prev = letters.value[current.value];
    if (prev) prev.answerStatus = 0;
    emitNext();
  }
}

function onWindowKey(event: KeyboardEvent) {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
    event.preventDefault();
    typeKey(event.shiftKey ? event.key.toUpperCase() : event.key.toLowerCase());
    return;
  }
  if (event.key === "Backspace") {
    event.preventDefault();
    typeKey("Backspace");
  }
}

watch(() => props.english, rebuild, { immediate: true });

onMounted(() => window.addEventListener("keydown", onWindowKey));
onUnmounted(() => window.removeEventListener("keydown", onWindowKey));

defineExpose({ typeKey });
</script>
