/** 每次发版手动改这个值（或构建时替换），SW 文件内容一变浏览器就会走更新流程 */
const SW_VERSION = "v1";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (event.request.mode !== "navigate") return;
    // 页面导航走网络优先，保证用户拿到最新 index.html
    event.respondWith(fetch(event.request).catch(() => caches.match("/")));
});