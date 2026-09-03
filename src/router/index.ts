import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "@/api/token";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseDetailPage from "@/pages/CourseDetailPage.vue";
import CourseMallPage from "@/pages/CourseMallPage.vue";
import HomePage from "@/pages/HomePage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import MyLessonDetailPage from "@/pages/MyLessonDetailPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", redirect: "/login/index" },
    { path: "/login/index", component: LoginPage },
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", redirect: "/home/index" },
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

router.beforeEach((to: any) => {
  const loggedIn = Boolean(getToken());
  const isLogin = to.path.startsWith("/login");
  const isPublic = to.matched.some((record: any) => record.meta.public === true);
  if (isLogin) {
    if (loggedIn) return "/home/index";
    return true;
  }
  if (isPublic) return true;
  if (!loggedIn) return "/login/index";
  return true;
});

export default router;
