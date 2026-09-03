import fs from "node:fs";
import path from "node:path";

const raw = fs.readFileSync(
  "C:/Users/root/.cursor/browser-logs/cdp-response-Runtime.evaluate-2026-09-03T06-36-52-406Z.json",
  "utf8",
);
const parsed = JSON.parse(raw);
const data = JSON.parse(parsed.result.value);
const out = path.join(process.cwd(), "public/clone-assets/icons");
fs.mkdirSync(out, { recursive: true });

const names = [];
for (const menu of data.menus) {
  const label = menu.text || (String(menu.cls).includes("botSet") ? "设置" : "");
  if (!label || !menu.html) continue;
  const match = menu.html.match(/src="(data:image\/png;base64,[^"]+)/);
  if (!match) continue;
  const b64 = match[1].replace("data:image/png;base64,", "");
  const slug = label.replace(/\s+/g, "");
  fs.writeFileSync(path.join(out, `${slug}.png`), Buffer.from(b64, "base64"));
  names.push(slug);
}

console.log(names.join(", "));
console.log("count", names.length);
