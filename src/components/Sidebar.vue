<template>
  <aside class="sideBar flex0 flex col ani" :class="menuOpen ? 'sideBarOpen' : 'sideBarClose'">
    <div class="top flex ac hand">
      <RouterLink v-if="isLoggedIn" to="/home/index" class="flex ac" :style="{ color: 'inherit' }">
        <el-image class="cusAvatar img75 flex0" :src="avatarUrl" fit="cover"/>
        <div v-if="menuOpen" class="ml10">
          <div class="size-20 bold line1" style="max-width: 100px">{{ displayName }}</div>
          <img
              v-if="vipIcon"
              :src="vipIcon"
              class="vipIcon"
              alt=""
          />
        </div>
      </RouterLink>
      <div v-else class="pl30">
        <RouterLink to="/courseMall/index">
          <img src="/clone-assets/logo.png" class="logo hand" alt="哇学社"/>
        </RouterLink>
      </div>
    </div>
    <div class="menuList flex col jb">
      <div class="flex1">
        <div v-for="(item, index) in primary" :key="item.label">
          <MenuDivider v-if="index === 1"/>
          <div v-if="index > 1" class="gap25"/>
          <MenuItem v-bind="item"/>
        </div>
        <!--          <MenuDivider />
        <div v-for="item in study" :key="item.label">
               <MenuItem v-bind="item" />
               <div class="gap25" />
             </div>
             <MenuDivider />
             <div v-for="item in social" :key="item.label">
               <MenuItem v-bind="item" />
               <div class="gap25" />
             </div>
             <MenuDivider />
             <div v-for="item in promo" :key="item.label">
               <MenuItem v-bind="item" />
               <div class="gap25" />
             </div>-->
      </div>
      <div class="menu botSet flex0 hand flex jc ac mt30">
        <img :src="iconSrc('设置')" class="img24 opc6" alt=""/>
        <span class="ml10 size28">设置</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {menuOpen} from "@/composables/useLayout";
import {avatarUrl, displayName, isLoggedIn, vipId} from "@/composables/useAuth";
import MenuDivider from "./MenuDivider.vue";
import MenuItem from "./MenuItem.vue";

const primary = [
  {label: "首页", icon: "首页", to: "/home/index"},
  {label: "课程广场", icon: "课程广场", to: "/courseMall/index"},
  {label: "教材同步", icon: "教材同步"},
  {label: "单词仓库", icon: "单词仓库"},
  {label: "音标课程", icon: "音标课程"},
  /*  { label: "AI 对话", icon: "AI对话" },
    { label: "PK竞技场", icon: "PK竞技场" },*/
];

const study = [
  {label: "学习计划", icon: "学习计划"},
  {label: "学习手账", icon: "学习手账"},
  {label: "我的收藏", icon: "我的收藏"},
];

const social = [
  {label: "排行榜", icon: "排行榜"},
  {label: "AI创课坊", icon: "AI创课坊"},
];

const promo = [
  {label: "合伙人计划", icon: "合伙人计划", tone: "highMenu1"},
  {label: "学社主理人", icon: "学社主理人", tone: "highMenu3"},
  {label: "开通学习卡", icon: "开通学习卡", tone: "highMenu2"},
  {label: "推广奖励", icon: "推广奖励"},
];

const vipIcon = computed(() => {
  if (vipId.value === 1) return "/clone-assets/home/tag-p2.png";
  if (vipId.value === 2) return "/clone-assets/home/tag-p.png";
  if (vipId.value === 3) return "/clone-assets/home/tag-study-m.png";
  return "/clone-assets/home/tag-study-m.png";
});

function iconSrc(name: string) {
  return `/clone-assets/icons/${name}.png`;
}
</script>
