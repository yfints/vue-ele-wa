<template>
  <div class="headBar flex jb ac" :class="menuOpen ? 'head1' : 'head2'">
    <div class="flex ac flex1">
      <button type="button" class="menuBox flex ac" aria-label="切换菜单" @click="toggleMenu">
        <img src="/clone-assets/menu.png" class="img32" alt="" />
      </button>
      <div class="pc flex ac flex1">
        <el-breadcrumb separator="/" aria-label="面包屑">
          <el-breadcrumb-item
            v-for="(crumb, index) in breadcrumbs"
            :key="`${crumb.label}-${index}`"
            :to="index < breadcrumbs.length - 1 ? crumb.to : undefined"
          >
            {{ crumb.label }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="search ml30 flex ac hand bigElement" @click="openSearch">
          <div class="img26 opc6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704"
              />
            </svg>
          </div>
          <div class="opc6 size-20 ml15">搜索你想要的课程</div>
        </div>
        <div class="img30 ml20 opc6 smallElement hand" @click="openSearch">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
            <path
              fill="currentColor"
              d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704"
            />
          </svg>
        </div>
      </div>
    </div>
    <div class="flex ac flex0">
      <div class="headIcon mr30 phone" @click="openSearch">
        <div class="flex ac headItem pc">
          <div class="img30" v-html="searchIcon" />
          <div class="desc">搜索课程</div>
        </div>
        <div class="img30 opc6 phone" v-html="searchIcon" />
      </div>
      <div v-for="item in headItems" :key="item.label" class="headIcon mr30">
        <div class="flex ac headItem pc">
          <div class="img30" v-html="item.icon" />
          <div class="desc">{{ item.label }}</div>
        </div>
        <div class="img30 opc6 phone" v-html="item.icon" />
      </div>
      <ThemeToggle />
      <RouterLink :to="profileTo">
        <el-image :src="avatarUrl" class="img48 hand circle" fit="cover" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { menuOpen, openSearch, toggleMenu } from "@/composables/useLayout";
import { avatarUrl, isLoggedIn } from "@/composables/useAuth";
import ThemeToggle from "./ThemeToggle.vue";

const route = useRoute();

interface Crumb {
  label: string;
  to?: string;
}

const breadcrumbs = computed<Crumb[]>(() => {
  const titled = route.matched.filter((record) => typeof record.meta.title === "string");
  return titled.map((record, index) => ({
    label: String(record.meta.title),
    to: index < titled.length - 1 ? record.path : undefined,
  }));
});

const profileTo = computed(() =>
  isLoggedIn.value
    ? "/home/index"
    : { path: "/login/index", query: { redirect: route.fullPath } },
);

const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704"/></svg>`;

const wechatIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 160c176.736 0 320 115.328 320 257.6 0 142.24-143.264 257.6-320 257.6-32.16 0-63.2-3.84-92.64-11.04L256 768l46.08-110.08C230.08 610.56 192 517.76 192 417.6 192 275.328 335.264 160 512 160m-96 192a48 48 0 1 0 0 96 48 48 0 0 0 0-96m192 0a48 48 0 1 0 0 96 48 48 0 0 0 0-96"/></svg>`;
const desktopIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M128 192h768a64 64 0 0 1 64 64v448a64 64 0 0 1-64 64H576l64 128h-256l64-128H128a64 64 0 0 1-64-64V256a64 64 0 0 1 64-64m64 64v384h640V256z"/></svg>`;

const guestItems = [
  {
    label: "客服咨询",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M864 409.6a192 192 0 0 1-37.888 349.44A256.064 256.064 0 0 1 576 960h-96a32 32 0 1 1 0-64h96a192.064 192.064 0 0 0 181.12-128H736a32 32 0 0 1-32-32V416a32 32 0 0 1 32-32h32c10.368 0 20.544.832 30.528 2.432a288 288 0 0 0-573.056 0A193.235 193.235 0 0 1 256 384h32a32 32 0 0 1 32 32v320a32 32 0 0 1-32 32h-32a192 192 0 0 1-96-358.4 352 352 0 0 1 704 0M256 448a128 128 0 1 0 0 256zm640 128a128 128 0 0 0-128-128v256a128 128 0 0 0 128-128"/></svg>`,
  },
  {
    label: "关注我们",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="m512 747.84 228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72z"/></svg>`,
  },
  {
    label: "建议反馈",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M128 224v512a64 64 0 0 0 64 64h160v96.064L544.256 800H832a64 64 0 0 0 64-64V224a64 64 0 0 0-64-64H192a64 64 0 0 0-64 64m64 32h640v448H520.32L416 829.44V704H192z"/></svg>`,
  },
  {
    label: "系统消息",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a288 288 0 0 1 288 288v256a32 32 0 0 0 32 32h32a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64h32a32 32 0 0 0 32-32V416a288 288 0 0 1 288-288m0 832a96 96 0 0 1-96-96h192a96 96 0 0 1-96 96"/></svg>`,
  },
];

const headItems = computed(() => {
  if (!isLoggedIn.value) return guestItems;
  return [
    { label: "微信群", icon: wechatIcon },
    { label: "添加桌面", icon: desktopIcon },
    ...guestItems,
  ];
});
</script>
