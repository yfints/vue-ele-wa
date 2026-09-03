import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  "assets/css/www.waxueshe.com/index-CvhtvZC7-f3b0ebc293.css",
  "utf8",
);

function dump(label, idx, radius = 400) {
  if (idx < 0) {
    console.log(`MISSING ${label}`);
    return;
  }
  console.log(`\n===== ${label} @${idx} =====`);
  console.log(css.slice(Math.max(0, idx - 40), Math.min(css.length, idx + radius)));
}

dump("body bg-container", css.indexOf("background-color:var(--bg-container);color:var(--text-default)"));
dump("headBar search", css.indexOf(".headBar .search"));
dump("searchBox in head", css.indexOf("botborContent_bgc"));
dump("img48", css.indexOf(".img48"));
dump("head2", css.indexOf(".head2"));
dump("sideBar white", css.indexOf(".sideBar[data-v-2c47e539]"));
dump("contentBox height mall", css.indexOf(".contentBox"));

const burgerSrc = "assets/images/AZ5vmfxkMXjKAAAAAElFTkSuQmCC-53cba45261.bin";
if (fs.existsSync(burgerSrc)) {
  fs.copyFileSync(burgerSrc, "public/clone-assets/menu.png");
  console.log("\ncopied menu.png", fs.statSync("public/clone-assets/menu.png").size);
}

const woffSrc = "assets/fonts/at.alicdn.com";
const woffDest = "public/fonts/at.alicdn.com";
if (fs.existsSync(woffSrc)) {
  fs.cpSync(woffSrc, woffDest, { recursive: true });
  console.log("copied alicdn fonts", fs.readdirSync(woffDest));
}

const icoSrc = "assets/images/www.waxueshe.com/favicon-d310e925ef.ico";
if (fs.existsSync(icoSrc)) {
  fs.copyFileSync(icoSrc, "public/favicon.ico");
  console.log("copied favicon.ico");
} else {
  const alt = fs.readdirSync("assets/images/www.waxueshe.com").filter((n) => n.includes("favicon") || n.includes("ico"));
  console.log("favicon candidates", alt);
}
