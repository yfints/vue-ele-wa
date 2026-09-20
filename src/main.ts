import { createApp } from "vue";
import ElementPlus, {ElMessageBox} from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import App from "./App.vue";
import router from "./router";
import { initTheme } from "./composables/useTheme";
import { fetchMe } from "./composables/useAuth";
import { getToken } from "./api/token";
import "./index.css";
import "./clone.css";

initTheme();

const app = createApp(App);
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.mount("#root");

/** 新 SW 接管时提示刷新（首次访问不算更新） 可关掉 */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    void ElMessageBox.confirm("检测到新版本，刷新后生效。是否立即刷新？", "版本更新", {
      confirmButtonText: "立即刷新",
      cancelButtonText: "稍后",
      type: "info",
    })
      .then(() => window.location.reload())
      .catch(() => {});
  });
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}

/**
 * 全局先拉一次用户资料：/game、/gameLoad 这些不经过 AppLayout 的页面
 * 也要能显示昵称和头像（否则刷新后只能回退成「学员」+ 默认头像）。
 */
if (getToken()) void fetchMe();

/**
 * 手机真机调试用的 vConsole：
 * 开发环境默认打开；打包后想在真机上看日志，访问地址后面加 `?vconsole=1`（或构建时设 VITE_VCONSOLE=1）。
 */
const vcParam = new URLSearchParams(window.location.search).get("vconsole");
const enableVConsole =
  vcParam != null
    ? vcParam !== "0"
    : import.meta.env.DEV || import.meta.env.VITE_VCONSOLE === "1";

if (enableVConsole) {
  void import("vconsole").then(({ default: VConsole }) => {
    new VConsole({ theme: "dark", log: { maxLogNumber: 500 } });
  });
}
