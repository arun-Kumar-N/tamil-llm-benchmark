// STEP 3 — aggregate scores into a leaderboard.
// Per model: average score per task, then the overall = mean of task averages
// (so no single big task dominates). Prints a table to the console.
import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { readJsonl } from "./io";
import type { Score, Task } from "./types";

const SCORE_DIR = "results/scores";

function main() {
  if (!existsSync(SCORE_DIR)) {
    console.error("No scores found. Run `npm run score` first.");
    process.exit(1);
  }

  const scores = readdirSync(SCORE_DIR)
    .filter((f) => f.endsWith(".jsonl"))
    .flatMap((f) => readJsonl<Score>(join(SCORE_DIR, f)));

  // model -> task -> scores[]
  const byModel = new Map<string, Map<Task, number[]>>();
  const allTasks = new Set<Task>();

  for (const s of scores) {
    allTasks.add(s.task);
    if (!byModel.has(s.model)) byModel.set(s.model, new Map());
    const tasks = byModel.get(s.model)!;
    if (!tasks.has(s.task)) tasks.set(s.task, []);
    tasks.get(s.task)!.push(s.score);
  }

  const tasks = [...allTasks].sort();
  const rows = [...byModel.entries()]
    .map(([model, taskMap]) => {
      const perTask: Record<string, string> = {};
      const taskAverages: number[] = [];
      for (const task of tasks) {
        const arr = taskMap.get(task) ?? [];
        if (arr.length) {
          const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
          perTask[task] = pct(avg);
          taskAverages.push(avg);
        } else {
          perTask[task] = "—";
        }
      }
      const overall = taskAverages.length
        ? taskAverages.reduce((a, b) => a + b, 0) / taskAverages.length
        : 0;
      return { model, overall, perTask };
    })
    .sort((a, b) => b.overall - a.overall);

  console.log("\n=== Tamil LLM Benchmark — leaderboard ===\n");
  console.table(
    rows.map((r) => ({ model: r.model, OVERALL: pct(r.overall), ...r.perTask })),
  );
  console.log("\nScores are 0–100 (higher = better). Overall = mean of per-task averages.");
}

function pct(x: number): string {
  return (x * 100).toFixed(1);
}

main();
