# Tamil LLM Benchmark — Design Spec v0.1

**Author:** Arunkumar N · **Drafted:** 2026-06-11 · **Target ship:** 2026-07-09

> Which AI models are actually good at Tamil? A public, reproducible answer.

**Deliverables:** ① open dataset on Hugging Face · ② eval harness (open source) · ③ public leaderboard site · ④ launch writeup

---

## 1. The 8 task categories

| # | Task | What it tests | Items (v1) | Scoring |
|---|------|--------------|-----------|---------|
| 1 | **EN → TA translation** | Generation quality, register | 40 | chrF + LLM-judge rubric |
| 2 | **TA → EN translation** | Comprehension | 40 | chrF + LLM-judge rubric |
| 3 | **Summarization (TA)** | Long-context Tamil understanding | 25 | LLM-judge rubric |
| 4 | **Reading comprehension (TA)** | QA over a Tamil passage | 40 | Exact/contains + judge |
| 5 | **Grammar correction (TA)** | Morphology, agreement | 30 | Exact match + judge |
| 6 | **Thanglish → Tamil transliteration** | Romanized Tamil (how people actually type) | 30 | Character F1 + judge |
| 7 | **Sentiment & intent (TA)** | Classification, colloquial usage | 35 | Accuracy (labels) |
| 8 | **Cultural & factual knowledge (TA)** | Tamil literature, TN geography/civics, customs | 35 | Accuracy + judge |

**v1 total: ~275 items.** Small but honest — quality over quantity. Expand to 500+ in v2 with community contributions.

### Sample items (illustrative)

```jsonc
// Task 1 — EN→TA
{ "id": "en-ta-001", "task": "translation_en_ta",
  "input": "The weather is nice today.",
  "reference": "இன்று வானிலை நன்றாக இருக்கிறது.",
  "metadata": { "register": "formal", "difficulty": "easy" } }

// Task 5 — Grammar correction (subject-verb agreement error)
{ "id": "gram-001", "task": "grammar_correction",
  "input": "அவர்கள் நேற்று வந்தான்.",
  "reference": "அவர்கள் நேற்று வந்தார்கள்.",
  "metadata": { "error_type": "agreement", "difficulty": "easy" } }

// Task 6 — Thanglish → Tamil (colloquial!)
{ "id": "thang-001", "task": "transliteration",
  "input": "naan naalaikku office varala",
  "reference": "நான் நாளைக்கு ஆபீஸ் வரல",
  "metadata": { "register": "colloquial", "difficulty": "medium" } }

// Task 7 — Sentiment
{ "id": "sent-001", "task": "sentiment",
  "input": "படம் சூப்பர், ஆனா கிளைமாக்ஸ் கொஞ்சம் சோகம்.",
  "reference": "mixed",
  "metadata": { "labels": ["positive", "negative", "neutral", "mixed"] } }
```

### Dataset rules (anti-contamination + quality)

- **Hand-write or hand-adapt every item.** No verbatim copying from Wikipedia, news sites, or existing benchmarks (models have memorized those).
- Cover **both registers**: formal (செந்தமிழ்) and colloquial/spoken — most benchmarks only test formal; colloquial is where models actually fail.
- Tag every item: `register`, `difficulty (easy/medium/hard)`, `dialect` where relevant.
- Each item reviewed twice (you, +1 native-speaker friend ideally) before inclusion.
- Format: **JSONL on Hugging Face**, CC-BY-4.0 license.

---

## 2. Models under test (v1)

| Family | Models | Access |
|---|---|---|
| Anthropic | Claude Opus 4.x, Sonnet 4.x, Haiku 4.x | API |
| OpenAI | latest GPT flagship + mini | API |
| Google | latest Gemini Pro + Flash | API |
| Sarvam AI | their current flagship | API |
| Open weights | Llama (latest), Gemma (latest) | Together/Groq/HF inference |

*Pin exact model IDs + date in `results/run-manifest.json` at run time. Budget: ~275 items × 10 models × ~600 tokens avg ≈ very manageable (<$50 total with mid-tier models; use batch APIs where available).*

### Extra metric: token efficiency 💡

Tamil is agglutinative — many tokenizers explode it into 3–6× more tokens than English. For each model, report **tokens per 100 Tamil characters** vs English baseline. This is a *real cost story* nobody talks about: "Tamil costs 4× more than English on model X." Very tweetable, zero extra eval cost.

---

## 3. Scoring design

**Two-layer scoring; never trust a single judge.**

1. **Automatic metrics** where ground truth allows: chrF (translation, via `sacrebleu`), accuracy (classification), character F1 (transliteration), exact match (grammar).
2. **LLM-as-judge** for open-ended quality (translation nuance, summaries, comprehension):
   - Rubric: 1–5 on *accuracy*, *fluency*, *register-appropriateness* (judge prompt in `harness/judge-prompt.md`)
   - **Cross-judge check:** score with TWO judge models from different families (e.g., Claude Opus + GPT flagship). Report agreement (Cohen's κ). Where they disagree ≥2 points → flag for human review (you).
   - **Self-preference guard:** when judging a model from the judge's own family, the *other* family's judge is authoritative.
3. **Human spot-check:** you review a random 10% of judged outputs per model. Report human↔judge agreement. (This is what makes the benchmark credible — and *you're qualified to do it*, which is the whole point.)

**Leaderboard score** = weighted mean per task → simple average across tasks (equal weights v1; publish per-task tables so people can re-weight).

---

## 4. Architecture

```
tamil-llm-benchmark/
├── dataset/            # JSONL per task (source of truth → mirrored to HuggingFace)
├── harness/            # TypeScript eval runner
│   ├── run.ts          # loops: dataset × models → completions (cached to disk)
│   ├── score.ts        # auto metrics + judge calls
│   ├── judge-prompt.md
│   └── providers/      # thin wrappers: anthropic, openai, google, sarvam, together
├── results/            # JSON outputs, one file per run (committed — reproducibility)
├── site/               # Next.js leaderboard (reads results/*.json statically)
└── SPEC.md             # this file
```

- **Harness in TypeScript** (your strength). Completions cached to disk so re-scoring never re-spends API money.
- **Leaderboard:** static Next.js on Vercel — overall table, per-task drill-down, token-efficiency chart, methodology page (the methodology page is what makes it credible).
- Everything reproducible: anyone can `npm run eval -- --model=x` against the public dataset.

---

## 5. Build order (4 weeks, ~35 hrs)

| Week | Work | Hours |
|---|---|---|
| **W1 (Jun 15–21)** | Write dataset: tasks 1, 2, 6, 7 (~145 items). Hardest, most valuable work — front-load it. | 10 |
| **W2 (Jun 22–28)** | Finish dataset (tasks 3, 4, 5, 8). Build provider wrappers + `run.ts`. First completions from 2 models. | 10 |
| **W3 (Jun 29–Jul 5)** | `score.ts`: auto metrics + dual-judge. Run all models. Human spot-check pass. | 9 |
| **W4 (Jul 6–9)** | Leaderboard site, HF dataset upload, methodology page, launch thread + blog post. **Ship Jul 9.** | 6 |

**Scope guards (when behind):** drop to 6 models, not 6 tasks · drop κ stats, keep dual-judge · leaderboard can be a static table first.

---

## 6. Launch checklist (Jul 9)

- [ ] Dataset live on Hugging Face (CC-BY-4.0, good dataset card)
- [ ] GitHub repo public: harness + results + methodology
- [ ] Leaderboard on Vercel
- [ ] Blog post: "I benchmarked N LLMs on Tamil. Here's what I found." — lead with 2–3 surprising findings (token-cost gap, colloquial-vs-formal gap, the model nobody expected to win)
- [ ] X thread (the findings, charts, links) + LinkedIn post
- [ ] Share to: Indic-NLP / AI4Bharat community channels, r/LocalLLaMA if open-weights results are interesting, HN (Show HN) — pick the 2–3 honest fits
- [ ] Email/DM AI4Bharat folks: "native-speaker-built Tamil benchmark, feedback welcome" — feedback ask, not promotion

---

## Open questions (decide by Jun 15)

1. Include **Tamil→Thanglish** direction too? (cheap to add, doubles task-6 value)
2. Include AI4Bharat's open models (IndicBART-family / their LLMs) for the "homegrown vs frontier" story?
3. Name: "Tamil LLM Benchmark" is clear but dry. Alternatives: **TamilEval**, **ThamizhBench**, **VattamBench**... pick one that's searchable + unambiguous. (Lean: **TamilEval**.)
