import fs from "node:fs";
const s = fs.readFileSync(
  "C:/Users/root/.cursor/projects/d-wkk/agent-tools/ce2173ee-c70f-4041-9a5e-6876f8d16ade.txt",
  "utf8",
);
const set = new Set();
for (const re of [/["'](\/api\/v2\/[^"']+)["']/g, /["'](api\/v2\/[^"']+)["']/g]) {
  let m;
  while ((m = re.exec(s))) set.add(m[1]);
}
console.log([...set].sort().join("\n"));
const loginHits = [];
const re2 = /login[^"']{0,40}/gi;
let m2;
let n = 0;
while ((m2 = re2.exec(s)) && n < 40) {
  loginHits.push(s.slice(Math.max(0, m2.index - 40), m2.index + 80).replace(/\s+/g, " "));
  n++;
}
console.log("\n--- login context ---\n");
console.log(loginHits.join("\n"));
