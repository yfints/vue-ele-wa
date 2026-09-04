<template>
  <div class="gameSuccessView">
    <div v-if="phonetic" class="opc6 tc size50">{{ phonetic }}</div>
    <div class="flex jc wrap bold6 cusFont size70 mt20">
      <div
        v-for="(word, index) in words"
        :key="`${word}-${index}`"
        class="word hand"
        @click="emit('speakWord', word)"
      >
        {{ word }}
      </div>
    </div>
    <div v-if="partOfSpeech" class="opc6 mt30 tc size50">{{ partOfSpeech }}</div>
    <div v-if="showChinese && chinese" class="mt30 tc size50">{{ chinese }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  english: string;
  chinese: string;
  phonetic?: string;
  partOfSpeech?: string;
  showChinese: boolean;
}>();

const emit = defineEmits<{
  speakWord: [word: string];
}>();

const words = computed(() => String(props.english || "").split(/\s+/).filter(Boolean));
</script>
