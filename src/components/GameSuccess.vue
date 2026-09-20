<template>
  <div class="gameSuccessView">
    <div v-if="result === 'wrong'" class="tc size30 mb20" style="color: #e62129">回答错误</div>
    <div v-else-if="result === 'correct'" class="tc size30 mb20" style="color: #16a34a">回答正确</div>

    <template v-if="speech">
      <div class="flex ac jc oralScore">
        <span class="oralScoreNum">{{ formatScore(speech.score) }}</span>
        <span class="oralScoreUnit">分</span>
      </div>
      <div class="flex jc wrap oralDims mt10">
        <span v-if="speech.accuracy != null">准确度 {{ formatScore(speech.accuracy) }}</span>
        <span v-if="speech.fluency != null">流利度 {{ formatScore(speech.fluency) }}</span>
        <span v-if="speech.standard != null">标准度 {{ formatScore(speech.standard) }}</span>
        <span v-if="speech.integrity != null">完整度 {{ formatScore(speech.integrity) }}</span>
      </div>
    </template>
    <div v-else-if="phonetic" class="opc6 tc size50">{{ phonetic }}</div>

    <div class="flex jc wrap bold6 cusFont size70 mt20">
      <div
        v-for="(word, index) in displayWords"
        :key="`${word.content}-${index}`"
        class="word"
        :class="{ wordBad: word.bad }"
      >
        {{ word.content }}
      </div>
    </div>

    <div v-if="partOfSpeech" class="opc6 mt30 tc size50">{{ partOfSpeech }}</div>
    <div v-if="chinese" class="mt30 tc size50">{{ chinese }}</div>
    <div v-if="expected" class="mt30 tc size28">正确答案：{{ expected }}</div>
    <div v-if="analysis" class="mt20 tc size20 opc6" style="max-width: 40rem">{{ analysis }}</div>

    <div v-if="retryable" class="flex jc mt30">
      <el-button type="primary" round @click="emit('retry')">重新录制</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SpeechScore } from "@/api/practice";

const props = defineProps<{
  phonetic?: string;
  words: string[];
  partOfSpeech?: string;
  chinese?: string;
  result?: string;
  expected?: string;
  analysis?: string;
  speech?: SpeechScore | null;
  retryable?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();

/** 口语评测有逐词分就按逐词标色，其它模式沿用原来的英文分词 */
const displayWords = computed(() => {
  const scored = props.speech?.words;
  if (scored?.length) {
    return scored.map((item) => ({
      content: item.content || "",
      bad: Number(item.score ?? 100) < 60 || Number(item.dpMessage ?? 0) !== 0,
    }));
  }
  return props.words.map((word) => ({ content: word, bad: false }));
});

function formatScore(value?: number) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  const num = Number(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}
</script>
