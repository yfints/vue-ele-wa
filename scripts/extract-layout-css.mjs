import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.join("assets/css/www.waxueshe.com/index-CvhtvZC7-f3b0ebc293.css"),
  "utf8",
);

const needles = [
  ".sideBar",
  ".sideBarOpen",
  ".headBar",
  ".head1",
  ".onMenuOpen",
  ".menuBox",
  ".gridContainer",
  ".page.flex",
  ".container",
  ".contentBox",
  ".headIcon",
  "微信",
  "puhui2",
  "html{",
  "body{",
  "--bg-box",
  "--bg-container",
  "font-size:16px",
  "font-size:14px",
  ".cardAct",
  ".highMenu",
  ".botSet",
  ".logo",
  ".search",
  "auto-font-size",
];

for (const needle of needles) {
  let idx = 0;
  let n = 0;
  while ((idx = css.indexOf(needle, idx)) !== -1 && n < 3) {
    const start = Math.max(0, idx - 80);
    const end = Math.min(css.length, idx + 280);
    console.log(`\n===== ${needle} #${n} @${idx} =====`);
    console.log(css.slice(start, end));
    idx += needle.length;
    n += 1;
  }
  if (n === 0) console.log(`\n===== MISSING ${needle} =====`);
}

const fontsDir = "assets/fonts";
console.log("\n===== fonts dir =====");
if (fs.existsSync(fontsDir)) {
  for (const name of fs.readdirSync(fontsDir)) {
    const p = path.join(fontsDir, name);
    const st = fs.statSync(p);
    console.log(st.isDirectory() ? `DIR ${name}` : `${name} ${st.size}`);
  }
} else {
  console.log("no assets/fonts");
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push({ p, size: st.size });
  }
  return acc;
}

console.log("\n===== public clone-assets =====");
const pub = walk("public/clone-assets");
console.log("count", pub.length);
const icons = pub.filter((x) => x.p.includes("icons"));
console.log("icons", icons.map((x) => path.basename(x.p)).join(", "));
const covers = pub.filter((x) => x.p.includes("covers"));
console.log("covers", covers.length);
console.log("root files", pub.filter((x) => !x.p.includes("icons") && !x.p.includes("covers")).map((x) => x.p));

console.log("\n===== public/fonts =====");
for (const f of walk("public/fonts")) console.log(path.basename(f.p), f.size);

console.log("\n===== images harvested =====");
const imgs = walk("assets/images");
console.log("image files", imgs.length);
console.log(imgs.slice(0, 20).map((x) => x.p).join("\n"));
