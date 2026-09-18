<template>
  <div class="headBar flex jb ac" :class="menuOpen ? 'head1' : 'head2'">
    <div class="flex ac flex1">
      <button type="button" class="menuBox flex ac" aria-label="切换菜单" @click="toggleMenu" v-if="isPhone">
        <img src="/clone-assets/menu.png" class="img32" alt=""/>
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
      </div>
    </div>
    <div class="flex ac flex0">
      <RouterLink :to="profileTo">
        <el-image :src="avatarUrl" class="img48 hand circle" fit="cover"/>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";
import {isPhone, menuOpen, toggleMenu} from "@/composables/useLayout";
import {avatarUrl, isLoggedIn} from "@/composables/useAuth";

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
        : {path: "/login/index", query: {redirect: route.fullPath}},
);

</script>
