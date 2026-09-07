import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "@/api/token";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseDetailPage from "@/pages/CourseDetailPage.vue";
import CourseMallPage from "@/pages/CourseMallPage.vue";
import HomePage from "@/pages/HomePage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import MyLessonDetailPage from "@/pages/MyLessonDetailPage.vue";
import GameLoadPage from "@/pages/GameLoadPage.vue";
import GamePage from "@/pages/GamePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", redirect: "/login/index" },
    { path: "/login/index", component: LoginPage },
    { path: "/gameLoad", component: GameLoadPage },
    { path: "/game", component: GamePage },
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", redirect: "/courseMall" },
        { path: "home", redirect: "/home/index" },
        { path: "home/index", component: HomePage },
        { path: "courseMall", component: CourseMallPage, meta: { public: true } },
        { path: "courseMall/index", component: CourseMallPage, meta: { public: true } },
        { path: "courseMall/detail/:id", component: MyLessonDetailPage, meta: { public: true } },
        { path: "courseMall/:courseId", component: CourseDetailPage, meta: { public: true } },
        { path: "courses", redirect: "/courseMall/index", meta: { public: true } },
        {
          path: "courses/:courseId",
          redirect: (to: any) => `/courseMall/${String(to.params.courseId)}`,
          meta: { public: true },
        },
        { path: ":pathMatch(.*)*", redirect: "/home/index" },
      ],
    },
  ],
});

function safeRedirect(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "";
}

router.beforeEach((to: any) => {
  const loggedIn = Boolean(getToken());
  const isLogin = to.path.startsWith("/login");
  const isPublic = to.matched.some((record: any) => record.meta.public === true);
  if (isLogin) {
    if (loggedIn) return safeRedirect(to.query.redirect) || "/home/index";
    return true;
  }
  if (isPublic) return true;
  if (!loggedIn) {
    return { path: "/login/index", query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
