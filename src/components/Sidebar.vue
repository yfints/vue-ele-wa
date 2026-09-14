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
import { markRaw } from "vue";
import {
  Calendar,
  Collection,
  EditPen,
  Headset,
  House,
  Notebook,
  Present,
  Reading,
  Star,
} from "@element-plus/icons-vue";
import { menuOpen } from "@/composables/useLayout";
import MenuItem from "./MenuItem.vue";

const primary = [
  { label: "首页", icon: markRaw(House), to: "/home/index" },
  { label: "课程广场", icon: markRaw(Reading), to: "/courseMall/index" },
  { label: "教材学习", icon: markRaw(Notebook) },
  { label: "单词库", icon: markRaw(Collection) },
  { label: "音标练习", icon: markRaw(Headset) },
  { label: "学习计划", icon: markRaw(Calendar) },
  { label: "学习手帐", icon: markRaw(EditPen) },
  { label: "我的收藏", icon: markRaw(Star), to: "/myCourse/sentence" },
  { label: "开通会员", icon: markRaw(Present), tone: "dashVip" },
];
</script>
