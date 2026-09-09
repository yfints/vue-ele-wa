<template>
  <div class="contentBox">
    <div class="pl30 pr30 pt30">
      <div class="cates">
        <div class="flex jb ac pb20">
          <div class="flex ac">
            <button
              type="button"
              class="cate gray mr20"
              :class="{ cateAct: categoryId === 0 }"
              @click="categoryId = 0"
            >
              全部
            </button>
            <button
              v-for="category in lessonCategories"
              :key="category.id"
              type="button"
              class="cate gray mr20"
              :class="{ cateAct: categoryId === category.id }"
              @click="categoryId = category.id"
            >
              {{ category.name }}
            </button>
          </div>
          <div class="flex0">
            <el-link type="info" :underline="'hover'" :href="moreCoursesUrl">
              <el-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M192 736h640V128H256a64 64 0 0 0-64 64zm64-672h608a32 32 0 0 1 32 32v672a32 32 0 0 1-32 32H160l-32 57.536V192A128 128 0 0 1 256 64"
                  />
                  <path
                    fill="currentColor"
                    d="M240 800a48 48 0 1 0 0 96h592v-96zm0-64h656v160a64 64 0 0 1-64 64H240a112 112 0 0 1 0-224m144-608v250.88l96-76.8 96 76.8V128zm-64-64h320v381.44a32 32 0 0 1-51.968 24.96L480 384l-108.032 86.4A32 32 0 0 1 320 445.44z"
                  />
                </svg>
              </el-icon>
              想要更多课程？
            </el-link>
          </div>
        </div>
      </div>
      <div v-loading="loading" class="pageScroll listScroll">
        <el-empty v-if="!loading && !filtered.length" description="暂无课程" />
        <div v-else class="gridContainer">
          <MallCard v-for="lesson in filtered" :key="lesson.id" :lesson="lesson" />
        </div>
        <div class="opc6 size20 mt30 pb20">共 {{ mallTotal }} 门课，当前展示 {{ filtered.length }} 门</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import MallCard from "@/components/MallCard.vue";
import { toMallLesson, type MallLesson } from "@/data/mall";
import {
  fetchCourseCategories,
  fetchCourses,
  type CourseCategory,
} from "@/api/course";

const moreCoursesUrl = "https://hcn2xg5ch01u.feishu.cn/share/base/form/shrcnxt6O7BuVRjxTvMYoOJHyEh";
const categoryId = ref(0);
const lessonCategories = ref<CourseCategory[]>([]);
const filtered = ref<MallLesson[]>([]);
const mallTotal = ref(0);
const loading = ref(false);

async function loadCategories() {
  try {
    const list = await fetchCourseCategories();
    lessonCategories.value = Array.isArray(list) ? list : [];
  } catch {
    lessonCategories.value = [];
  }
}

async function loadCourses() {
  loading.value = true;
  try {
    const page = await fetchCourses({
      categoryId: categoryId.value || undefined,
      current: 1,
      size: 50,
    });
    const records = page?.records || [];
    filtered.value = records.map(toMallLesson);
    mallTotal.value = Number(page?.total ?? records.length);
  } catch {
    filtered.value = [];
    mallTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

watch(categoryId, () => {
  void loadCourses();
});

onMounted(() => {
  void loadCategories();
  void loadCourses();
});
</script>
