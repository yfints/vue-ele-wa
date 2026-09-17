<template>
  <aside class="sideBar flex0 flex col ani" :class="menuOpen ? 'sideBarOpen' : 'sideBarClose'">
    <div class="top flex ac">
      <RouterLink to="/home/index" class="dashLogo flex ac">
        <img src="/clone-assets/home/logo-englishgo.png" class="dashLogoImg" alt="Englishgo" />
      </RouterLink>
    </div>
    <div class="menuList flex col jb">
      <div class="flex1">
        <div v-for="item in primary" :key="item.label" class="dashMenuWrap">
          <MenuItem v-bind="item" />
        </div>
      </div>
      <img src="/clone-assets/home/slogan.png" class="dashSlogan" alt="每天进步一点点" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { menuOpen } from "@/composables/useLayout";
import MenuItem from "./MenuItem.vue";

const primary = [
  {
    label: "首页",
    icon: "/clone-assets/menu/home.svg",
    to: "/home/index",
  },
  {
    label: "课程广场",
    icon: "/clone-assets/menu/course.svg",
    to: "/courseMall/index",
  },
  {
    label: "教材学习",
    icon: "/clone-assets/menu/book.svg",
    to: "/textbook/index",
  },
  {
    label: "单词库",
    icon: "/clone-assets/menu/word.svg",
  },
  {
    label: "音标练习",
    icon: "/clone-assets/menu/phonetic.svg",
  },
  {
    label: "学习计划",
    icon: "/clone-assets/menu/plan.svg",
  },
  {
    label: "学习手帐",
    icon: "/clone-assets/menu/journal.svg",
  },
  {
    label: "我的收藏",
    icon: "/clone-assets/menu/favorite.svg",
    to: "/myCourse/sentence",
  },
  {
    label: "开通会员",
    icon: "/clone-assets/menu/vip.png",
    tone: "dashVip",
  },
];
</script>
