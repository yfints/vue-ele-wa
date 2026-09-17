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

      <el-dropdown trigger="click">
        <button type="button" class="tbUser flex ac">
          <el-image class="tbUserAvatar" :src="avatarUrl" fit="cover" />
          <span class="tbUserName">{{ displayName }}</span>
          <el-icon class="tbUserArrow"><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="toggleTheme">
              {{ isDark ? "白天模式" : "夜间模式" }}
            </el-dropdown-item>
            <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import { avatarUrl, displayName, logout } from "@/composables/useAuth";
import { isDark, toggleTheme } from "@/composables/useTheme";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import {
  editionTone,
  gradeTone,
  textbookEditions,
  textbookGrades,
  textbookList,
  type TextbookItem,
} from "@/data/textbook";

const router = useRouter();
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

function onLogout() {
  logout();
  void router.push("/login/index");
}
</script>
