import fs from "node:fs";
const s = fs.readFileSync(
  "C:/Users/root/.cursor/projects/d-wkk/agent-tools/ce2173ee-c70f-4041-9a5e-6876f8d16ade.txt",
  "utf8",
);
for (const needle of ['m5="', "m5='", "const m5=", "h5=", "p5=", "mW=", "function L(", "nt=", "/auth/login"]) {
  let i = s.indexOf(needle);
  console.log(`\n===== ${needle} @${i} =====`);
  if (i >= 0) console.log(s.slice(Math.max(0, i - 50), i + 180).replace(/\s+/g, " "));
}
const i = s.indexOf('baseURL:"https://api.waxueshe.com"');
console.log("\n===== around axios =====");
console.log(s.slice(i - 200, i + 500).replace(/\s+/g, " "));
