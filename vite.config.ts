import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  // basicSsl：开发服务器走 HTTPS。手机端 getUserMedia（录音）要求安全来源，
  // 用 http://192.168.x.x:5173 打开时 navigator.mediaDevices 直接是 undefined，录不了音。
  plugins: [vue(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://test-jiaopei.zrgy-bbg.com",
       // target: "https://api.waxueshe.com",
        changeOrigin: true,
        // 口语评测走 WebSocket，代理必须透传升级请求，否则握手到 5173 就断了
        ws: true,
      },
      "/res-cdn": {
        target: "https://res.waxueshe.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/res-cdn/, ""),
        headers: {
          Referer: "https://www.waxueshe.com/",
        },
      },
    },
  },
});
