import fs from "node:fs";
const s = fs.readFileSync(
  "C:/Users/root/.cursor/projects/d-wkk/agent-tools/ce2173ee-c70f-4041-9a5e-6876f8d16ade.txt",
  "utf8",
);
const i = s.lastIndexOf("export{");
console.log("last export@", i, s.slice(i, i + 2500));
const j = s.indexOf("hT");
console.log("\nfirst hT", j, s.slice(Math.max(0, j - 30), j + 50));
