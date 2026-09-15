import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
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
