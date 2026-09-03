import fs from "node:fs";
const css = fs.readFileSync("assets/css/www.waxueshe.com/index-CvhtvZC7-f3b0ebc293.css", "utf8");

function around(needle, before = 80, after = 500) {
  const i = css.indexOf(needle);
  console.log(`\n===== ${needle} @${i} =====`);
  if (i >= 0) console.log(css.slice(Math.max(0, i - before), i + after));
}

around("@media (min-width: 1200px)", 0, 400);
around("@media (min-width: 992px)", 0, 200);
around(".el-tag--plain.el-tag--info", 0, 350);
around(".el-tag.is-round", 0, 200);
around(".el-tag{", 0, 800);
around("--el-color-info-light-5", 0, 200);
around("--el-fill-color-blank", 0, 120);
around(".el-col{display", 0, 400);
around("guttered", 0, 250);
