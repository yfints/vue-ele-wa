<template>
  <div class="page flex">
    <Sidebar />
    <div
      v-show="isPhone && menuOpen"
      class="mask"
      @click="closeMenu"
    />
    <div class="container flex1" :class="menuOpen ? 'onMenuOpen' : 'onMenuClose'">
      <TopBar />
      <RouterView />
    </div>
    <SearchPop />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import TopBar from "@/components/TopBar.vue";
import SearchPop from "@/components/SearchPop.vue";
import { closeMenu, initLayoutViewport, isPhone, menuOpen } from "@/composables/useLayout";
import { fetchMe } from "@/composables/useAuth";

const route = useRoute();
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
