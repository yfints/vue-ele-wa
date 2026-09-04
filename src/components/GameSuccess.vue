<template>
  <div class="gameSuccessView">
    <div v-if="phonetic" class="opc6 tc size50">{{ phonetic }}</div>
    <div class="flex jc wrap bold6 cusFont size70 mt20">
      <div v-for="(word, index) in words" :key="`${word}-${index}`" class="word">{{ word }}</div>
    </div>
    <div v-if="partOfSpeech" class="opc6 mt30 tc size50">{{ partOfSpeech }}</div>
    <div v-if="chinese" class="mt30 tc size50">{{ chinese }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  phonetic?: string;
  words: string[];
  partOfSpeech?: string;
  chinese?: string;
}>();
</script>
