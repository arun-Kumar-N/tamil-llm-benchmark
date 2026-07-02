// Generate REVIEW.md — a readable sheet of every dataset item for the native
// speaker to verify. Re-run anytime the dataset grows: `npm run review`.
import { writeFileSync } from "node:fs";
import { loadDataset } from "./io";
import type { TestItem } from "./types";

// Items Claude was explicitly unsure about — check these first.
const FLAGGED = new Set([
  "gram-004",
  "gram-006",
  "gram-009",
  "thang-005",
  "thang-015",
  "thang-018",
  "thang-019",
  "ta-en-007",
  "ta-en-009",
  "ta-en-010",
]);

const items = loadDataset();
const byTask = new Map<string, TestItem[]>();
for (const i of items) {
  if (!byTask.has(i.task)) byTask.set(i.task, []);
  byTask.get(i.task)!.push(i);
}

let md = `# Dataset review sheet\n\n`;
md += `${items.length} items across ${byTask.size} tasks.\n\n`;
md += `**How to use:** go down each row.\n`;
md += `- Reference is right → leave it.\n`;
md += `- Wrong → write the correction in the **fix** column (or just tell Claude the id + fix).\n`;
md += `- ⚠️ = Claude was unsure — check these first.\n\n`;

let flaggedCount = 0;
for (const [task, list] of byTask) {
  md += `## ${task} (${list.length})\n\n`;
  md += `| fix? | id | input | current reference | tags |\n|---|---|---|---|---|\n`;
  for (const it of list) {
    const flag = FLAGGED.has(it.id) ? "⚠️" : "";
    if (flag) flaggedCount++;
    const m = (it.metadata ?? {}) as Record<string, unknown>;
    const tags = [m.register, m.difficulty, m.error_type]
      .filter(Boolean)
      .map(String)
      .join(", ");
    const input = String(it.input).replace(/\|/g, "\\|");
    const ref = String(it.reference).replace(/\|/g, "\\|");
    md += `| ${flag} | ${it.id} | ${input} | ${ref} | ${tags} |\n`;
  }
  md += `\n`;
}

writeFileSync("REVIEW.md", md);
console.log(
  `Wrote REVIEW.md — ${items.length} items, ${byTask.size} tasks, ${flaggedCount} flagged for careful review.`,
);
