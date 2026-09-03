import fs from "node:fs";
import https from "node:https";
import path from "node:path";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.waxueshe.com/" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          get(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${url} ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

const root = process.cwd();
const cssUrl = "https://www.waxueshe.com/v0.0.141/assets/Detail-BAeT1SxN.css";
const apiUrl = "https://api.waxueshe.com/api/v2/lesson_details?id=1653";
const imgUrl = "https://www.waxueshe.com/v0.0.141/assets/42-Gn6aCmyT.png";
const tipsUrl = "https://www.waxueshe.com/v0.0.141/assets/Tips-DWZGwG5s.css";

fs.mkdirSync(path.join(root, "RECON/detail/fixtures"), { recursive: true });
fs.mkdirSync(path.join(root, "assets/css/www.waxueshe.com"), { recursive: true });
fs.mkdirSync(path.join(root, "public/clone-assets"), { recursive: true });

const css = await get(cssUrl);
fs.writeFileSync(path.join(root, "assets/css/www.waxueshe.com/Detail-BAeT1SxN.css"), css);
const tips = await get(tipsUrl);
fs.writeFileSync(path.join(root, "assets/css/www.waxueshe.com/Tips-DWZGwG5s.css"), tips);
const api = await get(apiUrl);
fs.writeFileSync(path.join(root, "RECON/detail/fixtures/lesson_details-1653.json"), api);
fs.writeFileSync(path.join(root, "src/data/lesson-details-1653.json"), api);
const img = await get(imgUrl);
fs.writeFileSync(path.join(root, "public/clone-assets/detail-deco.png"), img);

console.log({
  css: css.length,
  tips: tips.length,
  api: api.length,
  img: img.length,
  apiHead: api.toString("utf8").slice(0, 400),
});
