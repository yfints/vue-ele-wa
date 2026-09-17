<template>
  <div class="contentBox wordsPage">
    <header class="wdHead flex jb ac">
      <div class="wdHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="wdMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="wdTabs flex ac">
          <button
            v-for="item in wordCategories"
            :key="item"
            type="button"
            class="wdTab"
            :class="{ wdTabAct: category === item }"
            @click="category = item"
          >
            {{ item }}
          </button>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div class="wdBody">
      <div v-if="visibleList.length" class="wdGrid">
        <article
          v-for="book in visibleList"
          :key="book.id"
          class="wdCard"
          @click="openBook(book)"
        >
          <div class="wdCover" :style="{ '--wd-tone': book.tone }">
            <img class="wdIcon" :src="book.icon" :alt="book.title" />
            <button
              type="button"
              class="wdFav"
              :aria-label="isFav(book.id) ? '取消收藏' : '收藏'"
              @click.stop="toggleFav(book)"
            >
              <img
                :src="isFav(book.id) ? '/clone-assets/words/heart-active.svg' : '/clone-assets/words/heart.svg'"
                alt=""
              />
            </button>
          </div>
          <div class="wdInfo">
            <div class="wdTitle line1">{{ book.title }}</div>
            <div class="wdDesc line1">{{ book.desc }}</div>
            <div class="wdTags flex ac">
              <span v-for="tag in book.tags" :key="tag" class="wdTag">{{ tag }}</span>
            </div>
            <div class="wdProgress flex ac jb">
              <div class="wdBar">
                <div class="wdBarFill" :style="{ width: `${book.learned}%` }" />
              </div>
              <span class="wdLearned">已学{{ book.learned }}%</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="wdEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="wdEmptyImg" alt="" />
        <div class="wdEmptyText">该分类下暂无词库</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import { wordBooks, wordCategories, type WordBook } from "@/data/words";

const category = ref("全部");
const router = useRouter();
/** 设计稿里「商务英语核心词汇」是已收藏状态，先本地维护，等收藏接口接上再换成接口数据 */
const favIds = ref<number[]>([3]);

const visibleList = computed(() =>
  wordBooks.filter((book) => category.value === "全部" || book.category === category.value),
);

function isFav(id: number) {
  return favIds.value.includes(id);
}

function toggleFav(book: WordBook) {
  favIds.value = isFav(book.id)
    ? favIds.value.filter((id) => id !== book.id)
    : [...favIds.value, book.id];
}

function openBook(book: WordBook) {
  void router.push(`/words/${book.id}`);
}
</script>
