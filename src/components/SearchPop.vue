<template>
  <Teleport to="body">
    <div v-if="searchOpen" class="searchLayer">
      <div class="van-overlay vanPopupMask" @click="closeSearch" />
      <div class="van-popup van-popup--center" role="dialog" tabindex="0">
        <div class="galssPop popL searchPop">
          <div class="galssHead mb20 flex jb ac white">
            <div class="searchBox flex1 flex ac">
              <div class="img26 opc6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704"
                  />
                </svg>
              </div>
              <input
                ref="inputRef"
                v-model="searchQuery"
                class="size-20 ml15 flex1"
                type="text"
                placeholder="搜索你想要的课程"
              />
            </div>
            <button type="button" class="img60 hand ml20 searchClose" aria-label="关闭搜索" @click="closeSearch">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
                <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <div v-if="!query" class="white">
            <div class="gap100" />
            <div class="flex jc">
              <img src="/clone-assets/no-search.png" class="noSearch" alt="" />
            </div>
            <div class="tc opc6 size24 mt30 tips">试试输入课程名称吧？</div>
          </div>
          <div v-else class="pl30 pr30 white">
            <div class="flex ac title">
              <div class="size28 bold mr20">句子课程 ({{ hits.length }})</div>
            </div>
            <div class="searchContent">
              <div v-if="!hits.length">
                <div class="flex jc">
                  <img src="/clone-assets/search-no-data.png" class="noSearch" alt="" />
                </div>
                <div class="tc opc6 size24 mt30 tips">没有更多数据了</div>
              </div>
              <div v-else class="searchRow">
                <RouterLink
                  v-for="lesson in hits"
                  :key="lesson.id"
                  :to="`/courseMall/${lesson.id}`"
                  class="searchHitCard hand"
                  @click="closeSearch"
                >
                  <div class="imgBox">
                    <img :src="localAsset(lesson.image)" class="cardimg" alt="" />
                  </div>
                  <div class="line2 size-20 mt10">{{ lesson.name }}</div>
                </RouterLink>
              </div>
            </div>
            <div class="flex ac title">
              <div class="size28 bold mr20">单词仓库 (0)</div>
            </div>
            <div class="searchContent">
              <div class="flex jc">
                <img src="/clone-assets/search-no-data.png" class="noSearch" alt="" />
              </div>
              <div class="tc opc6 size24 mt30 tips">没有更多数据了</div>
            </div>
          </div>
          <div class="gap40" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { closeSearch, searchOpen, searchQuery } from "@/composables/useLayout";
import { localAsset, mallLessons } from "@/data/mall";

const inputRef = ref<HTMLInputElement | null>(null);

const query = computed(() => searchQuery.value.trim().toLowerCase());
const hits = computed(() => {
  if (!query.value) return [];
  return mallLessons.filter((lesson) => lesson.name.toLowerCase().includes(query.value));
});

watch(searchOpen, async (open) => {
  document.body.classList.toggle("van-overflow-hidden", open);
  if (open) {
    await nextTick();
    inputRef.value?.focus();
  }
});

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape" && searchOpen.value) closeSearch();
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  document.body.classList.remove("van-overflow-hidden");
});
</script>
