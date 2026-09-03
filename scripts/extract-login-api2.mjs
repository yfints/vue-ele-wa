import fs from "node:fs";
const s = fs.readFileSync(
  "C:/Users/root/.cursor/projects/d-wkk/agent-tools/ce2173ee-c70f-4041-9a5e-6876f8d16ade.txt",
  "utf8",
);
for (const needle of ["baseURL", "/auth/", "api.waxueshe", "hT=", "client:F", "Xl(\"Desktop\")"]) {
  let i = s.indexOf(needle);
  console.log(`\n===== ${needle} @${i} =====`);
  if (i >= 0) console.log(s.slice(Math.max(0, i - 120), i + 220).replace(/\s+/g, " "));
}
