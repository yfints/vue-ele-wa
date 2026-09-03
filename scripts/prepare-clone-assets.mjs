import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

const root = process.cwd();
const pub = path.join(root, "public", "clone-assets");
fs.mkdirSync(path.join(pub, "covers"), { recursive: true });
fs.mkdirSync(path.join(pub, "icons"), { recursive: true });
fs.mkdirSync(path.join(root, "src", "data"), { recursive: true });
fs.mkdirSync(path.join(root, "public", "fonts"), { recursive: true });

const mall = JSON.parse(
  fs.readFileSync(path.join(root, "RECON/network/fixtures/api-v2-lesson_mall-260df02169.json"), "utf8"),
);
const cats = JSON.parse(
  fs.readFileSync(path.join(root, "RECON/network/fixtures/api-v2-lesson_categories-7ca65e0598.json"), "utf8"),
);
const manifest = JSON.parse(fs.readFileSync(path.join(root, "RECON/asset-manifest.json"), "utf8"));

const urlToLocal = new Map();
for (const asset of manifest.assets) {
  if (asset.status === "ok" && asset.localPath) {
    urlToLocal.set(asset.url, String(asset.localPath).replaceAll("\\", "/"));
  }
}

function copyIfExists(from, to) {
  if (fs.existsSync(from) && fs.statSync(from).isFile()) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    return true;
  }
  return false;
}

copyIfExists(
  path.join(root, "assets/images/www.waxueshe.com/logo-k17KLA5_-39fdb88ed6.png"),
  path.join(pub, "logo.png"),
);
copyIfExists(
  path.join(root, "assets/images/www.waxueshe.com/ico-B8-iFjhn-3b4e903921.png"),
  path.join(pub, "ico.png"),
);
copyIfExists(
  path.join(root, "assets/images/www.waxueshe.com/favicon-d310e925ef.ico"),
  path.join(root, "public/favicon.ico"),
);
copyIfExists(
  path.join(root, "assets/images/www.waxueshe.com/follow-q0NAbTaM-3e4f44d18f.png"),
  path.join(pub, "follow.png"),
);

function copyDirFiles(fromDir, toDir) {
  if (!fs.existsSync(fromDir)) return;
  fs.mkdirSync(toDir, { recursive: true });
  for (const name of fs.readdirSync(fromDir)) {
    const from = path.join(fromDir, name);
    const to = path.join(toDir, name);
    const stat = fs.statSync(from);
    if (stat.isDirectory()) copyDirFiles(from, to);
    else fs.copyFileSync(from, to);
  }
}
copyDirFiles(path.join(root, "assets/fonts"), path.join(root, "public/fonts"));

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          Referer: "https://www.waxueshe.com/",
          "User-Agent": "Mozilla/5.0",
        },
      },
      (res) => {
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
      },
    );
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
  });
}

const imageUrls = new Set();
for (const item of mall.data.list) {
  if (item.image) imageUrls.add(item.image);
  if (item.founder?.head_img) imageUrls.add(item.founder.head_img);
}

const map = {};
let downloaded = 0;
let copied = 0;
const failed = [];

for (const url of imageUrls) {
  const destName = url.split("/").pop().split("?")[0].replace(/[^a-zA-Z0-9._-]/g, "_");
  const dest = path.join(pub, "covers", destName);
  const local = urlToLocal.get(url);
  const harvested = local ? path.join(root, "assets", local) : "";
  if (harvested && fs.existsSync(harvested) && fs.statSync(harvested).isFile()) {
    fs.copyFileSync(harvested, dest);
    map[url] = `/clone-assets/covers/${destName}`;
    copied += 1;
    continue;
  }
  if (fs.existsSync(dest)) {
    map[url] = `/clone-assets/covers/${destName}`;
    continue;
  }
  try {
    const buf = await get(url);
    fs.writeFileSync(dest, buf);
    map[url] = `/clone-assets/covers/${destName}`;
    downloaded += 1;
  } catch (error) {
    failed.push(`${url} ${error.message}`);
  }
}

fs.writeFileSync(path.join(root, "src/data/lesson-mall.json"), JSON.stringify(mall, null, 2));
fs.writeFileSync(path.join(root, "src/data/lesson-categories.json"), JSON.stringify(cats, null, 2));
fs.writeFileSync(path.join(root, "src/data/asset-map.json"), JSON.stringify(map, null, 2));

console.log(
  JSON.stringify(
    {
      copied,
      downloaded,
      failed: failed.length,
      total: imageUrls.size,
      failedSample: failed.slice(0, 8),
    },
    null,
    2,
  ),
);
