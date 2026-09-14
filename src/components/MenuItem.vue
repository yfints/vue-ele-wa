<template>
  <div class="menu ani" :class="[tone, collapsed ? 'menuClose' : '']">
    <RouterLink v-if="to" :to="to" class="hand" :style="{ color: 'inherit' }">
      <div class="card flex ac hand" :class="{ cardAct: active }">
        <img v-if="iconSrc" :src="active ? activeSrc : iconSrc" class="dashMenuIconImg" alt="" />
        <el-icon v-else-if="iconComp" class="dashMenuIcon"><component :is="iconComp" /></el-icon>
        <div class="ml10 size28 bold">{{ label }}</div>
      </div>
    </RouterLink>
    <div v-else class="card flex ac hand" :class="{ cardAct: active }" @click="onSoon">
      <img v-if="iconSrc" :src="active ? activeSrc : iconSrc" class="dashMenuIconImg" alt="" />
      <el-icon v-else-if="iconComp" class="dashMenuIcon"><component :is="iconComp" /></el-icon>
      <div class="ml10 size28 bold">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, menuOpen } from "@/composables/useLayout";

const props = defineProps<{
  label: string;
  icon: string | Component;
  activeIcon?: string;
  to?: string;
  active?: boolean;
  tone?: string;
}>();

const route = useRoute();
const iconComp = computed(() => (typeof props.icon === "string" ? null : props.icon));
const iconSrc = computed(() => (typeof props.icon === "string" ? props.icon : ""));
const activeSrc = computed(() => props.activeIcon || iconSrc.value);
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

function onSoon() {
  ElMessage.info(`${props.label}即将上线`);
}
</script>
