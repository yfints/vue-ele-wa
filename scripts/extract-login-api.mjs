import fs from "node:fs";
const s = fs.readFileSync(
  "C:/Users/root/.cursor/projects/d-wkk/agent-tools/ce2173ee-c70f-4041-9a5e-6876f8d16ade.txt",
  "utf8",
);
for (const needle of ["/auth/login", "auth/login", "TOKEN", "client:", "hT as"]) {
  let i = 0;
  let n = 0;
  while ((i = s.indexOf(needle, i)) >= 0 && n < 6) {
    console.log(`\n===== ${needle} @${i} =====`);
    console.log(s.slice(Math.max(0, i - 80), i + 160).replace(/\s+/g, " "));
    i += needle.length;
    n++;
  }
}
