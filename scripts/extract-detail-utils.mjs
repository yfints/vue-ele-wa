import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const css = fs.readFileSync("assets/css/www.waxueshe.com/index-CvhtvZC7-f3b0ebc293.css", "utf8");
const needles = [
  ".size26{",
  ".size30{",
  ".size-18{",
  ".bold6{",
  ".mt50{",
  ".mb10{",
  ".mb30{",
  ".img20{",
  ".mr5{",
  ".ast{",
  ".wrap{",
  ".el-tag{",
  ".el-tag--plain",
  ".el-tag--info",
  ".el-tag--small",
  ".el-tag--round",
  ".el-row{",
  ".el-col-lg-6",
  ".el-col-xl-6",
  ".el-col-24{",
  "is-round",
];
for (const n of needles) {
  const i = css.indexOf(n);
  console.log(`\n===== ${n} @${i} =====`);
  if (i >= 0) console.log(css.slice(i, i + 220));
}

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
          reject(new Error(String(res.statusCode)));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

const dark = await get("https://www.waxueshe.com/v0.0.141/assets/dark1-CJh75pOR.png");
fs.writeFileSync("public/clone-assets/detail-banner.png", dark);
console.log("\nbanner", dark.length);
