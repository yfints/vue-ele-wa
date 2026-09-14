<template>
  <div class="page flex" :class="{ isHome }">
    <Sidebar />
    <div
      v-show="isPhone && menuOpen"
      class="mask"
      @click="closeMenu"
    />
    <div class="container flex1" :class="[menuOpen ? 'onMenuOpen' : 'onMenuClose', { onHome: isHome }]">
      <TopBar v-if="!isHome" />
      <RouterView />
    </div>
    <SearchPop />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import TopBar from "@/components/TopBar.vue";
import SearchPop from "@/components/SearchPop.vue";
import { closeMenu, initLayoutViewport, isPhone, menuOpen } from "@/composables/useLayout";
import { fetchMe } from "@/composables/useAuth";

const route = useRoute();
const isHome = computed(() => route.path.startsWith("/home"));
let stopViewport: (() => void) | undefined;

onMounted(() => {
  stopViewport = initLayoutViewport();
  void fetchMe();
});

onUnmounted(() => {
  stopViewport?.();
});

watch(
  () => route.fullPath,
  () => {
    if (isPhone.value) closeMenu();
  },
);
</script>
