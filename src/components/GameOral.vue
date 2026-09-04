<template>
  <div class="flex col jc ac flex1 gameOral">
    <div class="flex wrap jc ac bold size70 oralLine">
      <div
        v-for="(word, index) in words"
        :key="`${word}-${index}`"
        class="word hand"
        @click="emit('speakWord', word)"
      >
        {{ word }}
      </div>
    </div>
    <div v-if="showChinese && chinese" class="opc6 mt30 tc size40">{{ chinese }}</div>
    <div class="flex col ac mt40">
      <div
        class="recordingLottie flex jc ac"
        :class="{ 'is-recording': recording, 'is-eval': evaluating }"
        @click="emit('record')"
      >
        <el-icon :size="36"><Microphone /></el-icon>
      </div>
      <div class="opc5 size24 mt10">口语评测 (Enter)</div>
    </div>
    <div v-if="transcript" class="oralHeard mt30 tc size24">{{ transcript }}</div>
    <div v-if="hint" class="oralHint opc6 mt20 tc size20">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Microphone } from "@element-plus/icons-vue";

const props = defineProps<{
  english: string;
  chinese: string;
  showChinese: boolean;
  recording: boolean;
  evaluating: boolean;
  hint: string;
  transcript: string;
}>();

const emit = defineEmits<{
  record: [];
  speakWord: [word: string];
}>();

const words = computed(() => String(props.english || "").split(/\s+/).filter(Boolean));
</script>
