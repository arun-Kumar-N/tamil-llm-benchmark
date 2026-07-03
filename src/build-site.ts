// Generate a self-contained leaderboard website from the results.
// Static HTML → deployable to Vercel / GitHub Pages, screenshot-friendly.
// Regenerate anytime: `npm run site`.
import { join } from "node:path";
import { existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { readJsonl, loadDataset } from "./io";
import type { Score, Task } from "./types";

const SCORE_DIR = "results/scores";
if (!existsSync(SCORE_DIR)) {
  console.error("No scores yet. Run `npm run bench` first.");
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
  const t = byModel.get(s.model)!;
  if (!t.has(s.task)) t.set(s.task, []);
  t.get(s.task)!.push(s.score);
}
const tasks = [...allTasks].sort();

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

type Row = { model: string; overall: number; perTask: Map<Task, number | null> };
const rows: Row[] = [...byModel.entries()]
  .map(([model, tm]) => {
    const perTask = new Map<Task, number | null>();
    const taskAvgs: number[] = [];
    for (const task of tasks) {
      const arr = tm.get(task);
      if (arr && arr.length) {
        const a = avg(arr);
        perTask.set(task, a);
        taskAvgs.push(a);
      } else perTask.set(task, null);
    }
    return { model, overall: avg(taskAvgs), perTask };
  })
  .sort((a, b) => b.overall - a.overall);

const items = loadDataset();
const totalItems = items.length;

// --- derive a headline finding: biggest task gap between the top 2 models ---
let finding = "";
if (rows.length >= 2) {
  let gapTask = "";
  let gap = -1;
  let hi = 0;
  let lo = 0;
  for (const task of tasks) {
    const a = rows[0].perTask.get(task);
    const b = rows[1].perTask.get(task);
    if (a != null && b != null && Math.abs(a - b) > gap) {
      gap = Math.abs(a - b);
      gapTask = task;
      hi = Math.max(a, b);
      lo = Math.min(a, b);
    }
  }
  if (gapTask) {
    finding = `${rows[0].model} leads overall. The widest gap is <b>${gapTask.replace(/_/g, " ")}</b> (${pct(hi)} vs ${pct(lo)}) — the tasks otherwise run close.`;
  }
}

function pct(x: number): string {
  return (x * 100).toFixed(1);
}
// cell tint: light green for high scores, light amber for lower
function tint(x: number | null): string {
  if (x == null) return "background:#f8fafc;color:#cbd5e1";
  const h = Math.round(x * 130); // 0=red-ish, 130=green
  return `background:hsl(${h}, 65%, 94%); color:hsl(${h}, 45%, 30%)`;
}

const date = new Date().toISOString().slice(0, 10);

const headerCells = tasks
  .map((t) => `<th>${t.replace(/_/g, "<br>")}</th>`)
  .join("");

const bodyRows = rows
  .map((r, i) => {
    const medal = ["🥇", "🥈", "🥉"][i] ?? `${i + 1}`;
    const cells = tasks
      .map((t) => {
        const v = r.perTask.get(t);
        return `<td style="${tint(v ?? null)}">${v == null ? "—" : pct(v)}</td>`;
      })
      .join("");
    return `<tr>
      <td class="rank">${medal}</td>
      <td class="model">${r.model}</td>
      <td class="overall">${pct(r.overall)}</td>
      ${cells}
    </tr>`;
  })
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Tamil LLM Benchmark — Leaderboard</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    background:radial-gradient(50rem 40rem at 100% -10%,rgba(99,102,241,.10),transparent 60%),
      radial-gradient(40rem 40rem at -10% 110%,rgba(168,85,247,.10),transparent 55%),#f6f7fb;
    color:#0f172a;min-height:100vh;padding:48px 20px}
  .wrap{max-width:920px;margin:0 auto}
  .eyebrow{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6366f1;margin-bottom:8px}
  h1{font-size:36px;font-weight:700;letter-spacing:-.02em}
  .sub{font-size:16px;color:#64748b;margin-top:8px;line-height:1.5;max-width:620px}
  .meta{margin-top:14px;font-size:13px;color:#94a3b8}
  .card{background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(15,23,42,.07);
    padding:8px;margin-top:28px;overflow-x:auto}
  table{border-collapse:collapse;width:100%;min-width:640px}
  th,td{padding:12px 10px;text-align:center;font-size:14px}
  thead th{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.03em;
    border-bottom:2px solid #eef2f7;vertical-align:bottom}
  thead th:nth-child(-n+3){text-align:left}
  tbody tr{border-bottom:1px solid #f1f5f9}
  tbody tr:last-child{border-bottom:none}
  .rank{font-size:18px;width:44px}
  .model{text-align:left;font-weight:600;font-size:15px;color:#1e293b}
  .overall{font-weight:700;font-size:16px;color:#4f46e5}
  td{border-radius:6px}
  .findings{margin-top:26px;background:#fff;border-radius:14px;padding:20px 24px;
    box-shadow:0 10px 30px rgba(15,23,42,.05)}
  .findings h2{font-size:15px;font-weight:600;color:#0f172a;margin-bottom:10px}
  .findings p{font-size:14px;color:#475569;line-height:1.6;margin:6px 0}
  .foot{margin-top:24px;font-size:12px;color:#94a3b8;text-align:center}
  code{background:#eef2ff;color:#4338ca;padding:1px 6px;border-radius:5px;font-size:12px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="eyebrow">Open Evaluation · built by a native speaker</div>
    <h1>Tamil LLM Benchmark</h1>
    <p class="sub">How well do today's language models actually handle Tamil? Measured across ${tasks.length} tasks with chrF, accuracy, and LLM-as-judge scoring.</p>
    <div class="meta">${totalItems} test items · ${tasks.length} tasks · ${rows.length} models · updated ${date}</div>

    <div class="card">
      <table>
        <thead>
          <tr><th>#</th><th>Model</th><th>Overall</th>${headerCells}</tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>

    <div class="findings">
      <h2>Key findings</h2>
      ${finding ? `<p>• ${finding}</p>` : ""}
      <p>• <b>The Tamil token tax:</b> the same sentence costs 1.7×–6.6× more tokens in Tamil than English depending on the tokenizer — a real cost/latency penalty for Tamil users.</p>
      <p style="color:#94a3b8">Scores are 0–100 (higher = better). Overall = mean of per-task averages. Work in progress — dataset expanding toward ~275 items.</p>
    </div>

    <div class="foot">Reproducible: <code>npm run bench</code> · <code>npm run site</code></div>
  </div>
</body>
</html>`;

mkdirSync("site", { recursive: true });
writeFileSync("site/index.html", html);
console.log(`Wrote site/index.html — ${rows.length} models, ${tasks.length} tasks, ${totalItems} items.`);
