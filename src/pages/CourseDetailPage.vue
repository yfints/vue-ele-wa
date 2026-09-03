<template>
  <div v-if="!lesson" class="contentBox">
    <div class="pl30 pr30">
      <div class="size28 mt30">没有找到这门课</div>
      <el-link type="info" class="mt30" @click="goMall">返回课程广场</el-link>
    </div>
  </div>
  <div v-else class="contentBox">
    <div class="pl30 pr30 detailScroll">
      <div class="lessonDetail">
        <div class="top flex ast mb30">
          <img src="/clone-assets/detail-deco.png" class="logo" alt="" />
          <el-image class="goodsimg mr20" :src="localAsset(lesson.image)" fit="cover" />
          <div class="flex1 flex col jb rel">
            <div class="flex jb ac">
              <div class="flex1">
                <div class="size28 mb10">{{ lesson.name }}</div>
                <div class="size20 gray">{{ lesson.describe }}</div>
              </div>
              <div class="flex ac wrap" />
            </div>
            <div class="size20 gray">共 {{ courseCount }} 个课程</div>
          </div>
        </div>
        <el-row :gutter="10">
          <el-col
            v-for="(course, index) in courses"
            :key="course.id"
            :xs="24"
            :sm="24"
            :md="24"
            :lg="6"
            :xl="6"
            class="mb30"
          >
            <div class="card hand" title="练习未接入">
              <div class="flex ac">
                <div class="size26 line1 flex1 mr20 bold6">{{ course.name }}</div>
                <el-tag type="info" size="small" effect="plain" round>暂未练习</el-tag>
              </div>
              <div class="flex jb ac mt50">
                <div class="flex ac size-18">
                  <div class="flex ac mr20">
                    <div class="img20 mr5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <path
                          fill="currentColor"
                          d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"
                        />
                        <path
                          fill="currentColor"
                          d="M480 256a32 32 0 0 1 32 32v256a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32"
                        />
                        <path
                          fill="currentColor"
                          d="M480 512h256q32 0 32 32t-32 32H480q-32 0-32-32t32-32"
                        />
                      </svg>
                    </div>
                    <div>练习时长：0分钟</div>
                  </div>
                </div>
                <div class="size30 opc6">#{{ index + 1 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getLessonDetails, getMallLesson, localAsset } from "@/data/mall";

const route = useRoute();
const router = useRouter();
const courseId = computed(() => String(route.params.courseId || ""));
function goMall() {
  void router.push("/courseMall/index");
}
const details = computed(() => (courseId.value ? getLessonDetails(courseId.value) : undefined));
const mallLesson = computed(() => (courseId.value ? getMallLesson(courseId.value) : undefined));
const lesson = computed(() => details.value ?? mallLesson.value);
const courses = computed(() => details.value?.lesson_courses ?? []);
const courseCount = computed(
  () => details.value?.course_published_count ?? lesson.value?.course_published_count ?? 0,
);
</script>
