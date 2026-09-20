<template>
  <div class="soundWaveSlot flex jc ac" :class="{ 'is-active': active }">
    <div v-for="n in 16" :key="n" class="waveBar" :style="{ animationDelay: `${n * 40}ms` }" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
}>();
</script>
