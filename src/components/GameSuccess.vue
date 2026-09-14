<template>
  <div class="gameSuccessView">
    <div v-if="result === 'wrong'" class="tc size30 mb20" style="color: #e62129">回答错误</div>
    <div v-else-if="result === 'correct'" class="tc size30 mb20" style="color: #16a34a">回答正确</div>
    <div v-if="phonetic" class="opc6 tc size50">{{ phonetic }}</div>
    <div class="flex jc wrap bold6 cusFont size70 mt20">
      <div v-for="(word, index) in words" :key="`${word}-${index}`" class="word">{{ word }}</div>
    </div>
    <div v-if="partOfSpeech" class="opc6 mt30 tc size50">{{ partOfSpeech }}</div>
    <div v-if="chinese" class="mt30 tc size50">{{ chinese }}</div>
    <div v-if="expected" class="mt30 tc size28">正确答案：{{ expected }}</div>
    <div v-if="analysis" class="mt20 tc size20 opc6" style="max-width: 40rem">{{ analysis }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  phonetic?: string;
  words: string[];
  partOfSpeech?: string;
  chinese?: string;
  result?: string;
  expected?: string;
  analysis?: string;
}>();
</script>
