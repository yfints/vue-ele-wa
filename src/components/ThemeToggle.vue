<template>
  <button
    type="button"
    class="headIcon mr30"
    :class="{ themeToggleOnly: iconOnly }"
    :aria-label="isDark ? '切换白天模式' : '切换夜间模式'"
    @click="toggleTheme"
  >
    <div class="flex ac headItem pc">
      <div class="img30" v-html="isDark ? sunIcon : moonIcon" />
      <div class="desc">{{ isDark ? "白天模式" : "夜间模式" }}</div>
    </div>
    <div class="img30 opc6 phone" v-html="isDark ? sunIcon : moonIcon" />
  </button>
</template>

<script setup lang="ts">
import { isDark, toggleTheme } from "@/composables/useTheme";

defineProps<{
  iconOnly?: boolean;
}>();

const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M528.768 129.024a384 384 0 1 0 366.336 366.336 32 32 0 0 0-42.88-42.88A320.128 320.128 0 0 1 571.648 171.84a32 32 0 0 0-42.88-42.816"/></svg>`;

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 192a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0v-64a32 32 0 0 1 32-32m0 512a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0v-64a32 32 0 0 1 32-32m384-192a32 32 0 0 1-32 32h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 32 32M192 512a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h64a32 32 0 0 1 32 32m564.736-240.192a32 32 0 0 1 0 45.248l-45.248 45.248a32 32 0 1 1-45.248-45.248l45.248-45.248a32 32 0 0 1 45.248 0M267.52 711.68a32 32 0 0 1 0 45.248l-45.248 45.248a32 32 0 1 1-45.248-45.248l45.248-45.248a32 32 0 0 1 45.248 0m497.216 45.248a32 32 0 0 1-45.248 0l-45.248-45.248a32 32 0 0 1 45.248-45.248l45.248 45.248a32 32 0 0 1 0 45.248M267.52 312.32a32 32 0 0 1-45.248 0l-45.248-45.248a32 32 0 1 1 45.248-45.248l45.248 45.248a32 32 0 0 1 0 45.248M512 384a128 128 0 1 1 0 256 128 128 0 0 1 0-256"/></svg>`;
</script>
