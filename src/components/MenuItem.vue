<template>
  <div class="menu ani" :class="[tone, collapsed ? 'menuClose' : '']">
    <RouterLink v-if="to" :to="to" class="hand" :style="{ color: 'inherit' }">
      <div class="card flex ac hand" :class="{ cardAct: active }">
        <img :src="iconSrc" class="img34" alt="" />
        <div class="ml10 size28 bold">{{ label }}</div>
      </div>
    </RouterLink>
    <div v-else class="card flex ac hand" :class="{ cardAct: active }">
      <img :src="iconSrc" class="img34" alt="" />
      <div class="ml10 size28 bold">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { isPhone, menuOpen } from "@/composables/useLayout";

const props = defineProps<{
  label: string;
  icon: string;
  to?: string;
  active?: boolean;
  tone?: string;
}>();

const route = useRoute();
const iconSrc = computed(() => `/clone-assets/icons/${props.icon}.png`);
const collapsed = computed(() => !menuOpen.value && !isPhone.value);
const active = computed(() => {
  if (props.active) return true;
  if (!props.to) return false;
  if (props.to.startsWith("/home")) return route.path.startsWith("/home");
  if (props.to.startsWith("/courseMall")) {
    return route.path.startsWith("/courseMall") || route.path.startsWith("/courses");
  }
  if (props.to.startsWith("/myCourse")) return route.path.startsWith("/myCourse");
  return route.path === props.to;
});
</script>
