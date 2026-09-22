<template>
  <div class="page flex">
    <Sidebar />
    <div
      v-show="isPhone && menuOpen"
      class="mask"
      @click="closeMenu"
    />
    <div class="container flex1" :class="[menuOpen ? 'onMenuOpen' : 'onMenuClose', { onBare: bareHeader }]">
      <TopBar v-if="!bareHeader" />
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
/** 首页 / 课程广场 / 教材学习 / 音标练习 / 单词库 / 个人信息自带顶部栏（顶部栏由页面自己渲染），所以隐藏公共 TopBar */
const bareHeader = computed(
  () =>
    route.path.startsWith("/home") ||
    // 课程广场列表页自带顶部分类栏；/courseMall/:id 课程详情页仍用公共 TopBar
    route.path === "/courseMall" ||
    route.path === "/courseMall/" ||
    route.path === "/courseMall/index" ||
    route.path.startsWith("/myCourse") ||
    route.path.startsWith("/textbook") ||
    route.path.startsWith("/phonetic") ||
    route.path.startsWith("/words") ||
    route.path.startsWith("/user"),
);
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
