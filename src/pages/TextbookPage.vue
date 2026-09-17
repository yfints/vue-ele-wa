<template>
  <div class="contentBox textbookPage">
    <header class="tbHead flex jb ac">
      <div class="tbHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="tbMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="tbGrades flex ac">
          <button
            v-for="item in textbookGrades"
            :key="item"
            type="button"
            class="tbGrade"
            :class="{ tbGradeAct: grade === item }"
            @click="grade = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <UserDropdown />
    </header>

    <div class="tbEditions flex ac">
      <button
        v-for="item in textbookEditions"
        :key="item"
        type="button"
        class="tbEdition"
        :class="{ tbEditionAct: edition === item }"
        @click="edition = item"
      >
        {{ item }}
        <span class="tbEditionBar" />
      </button>
    </div>

    <div class="tbBody">
      <div v-if="visibleList.length" class="tbGrid">
        <article
          v-for="book in visibleList"
          :key="book.id"
          class="tbCard hand"
          @click="openBook(book)"
        >
          <img class="tbCover" :src="book.cover" :alt="book.title" />
          <div class="tbInfo">
            <div class="tbTitle line1">{{ book.title }}</div>
            <div class="tbDesc line1">{{ book.desc }}</div>
            <div class="tbTags flex ac">
              <span class="tbTag" :style="{ background: gradeTone.bg, color: gradeTone.color }">
                {{ book.grade }}
              </span>
              <span
                class="tbTag"
                :style="{ background: toneOf(book.edition).bg, color: toneOf(book.edition).color }"
              >
                {{ book.edition }}
              </span>
              <span class="tbTag tbTagUnit">共{{ book.units }}单元</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="tbEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="tbEmptyImg" alt="" />
        <div class="tbEmptyText">该条件下暂无教材</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  editionTone,
  gradeTone,
  textbookEditions,
  textbookGrades,
  textbookList,
  type TextbookItem,
} from "@/data/textbook";

const grade = ref("全部");
const edition = ref("全部版本");

const visibleList = computed(() =>
  textbookList.filter((book) => {
    const gradeHit = grade.value === "全部" || book.grade === grade.value;
    const editionHit = edition.value === "全部版本" || book.edition === edition.value;
    return gradeHit && editionHit;
  }),
);

function toneOf(name: string) {
  return editionTone[name] || gradeTone;
}

function openBook(book: TextbookItem) {
  ElMessage.info(`${book.title}即将上线`);
}

</script>
