// Automatic scoring — no LLM needed, objective and free.

// Normalize for label comparison: lowercase, trim, collapse spaces.
function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// Accuracy for classification (e.g. sentiment): 1 if the label matches, else 0.
// We check the reference label appears as a whole word in the model's output,
// so "Label: positive" still counts.
export function accuracy(output: string, reference: string): number {
  const out = norm(output);
  const ref = norm(reference);
  if (out === ref) return 1;
  return new RegExp(`\\b${ref}\\b`).test(out) ? 1 : 0;
}

// chrF: character n-gram F-score (a simplified chrF2, beta=2).
// Great for morphologically rich languages like Tamil because it scores at the
// character level instead of whole words. Returns 0..1.
// (For publication you may swap in sacreBLEU's chrF; this is the teaching version.)
export function chrf(output: string, reference: string, maxN = 6, beta = 2): number {
  const hyp = norm(output);
  const ref = norm(reference);
  if (!hyp || !ref) return 0;

  const fScores: number[] = [];
  for (let n = 1; n <= maxN; n++) {
    const h = ngramCounts(hyp, n);
    const r = ngramCounts(ref, n);
    if (h.total === 0 || r.total === 0) continue;

    let match = 0;
    for (const [gram, count] of h.counts) {
      match += Math.min(count, r.counts.get(gram) ?? 0);
    }
    const precision = match / h.total;
    const recall = match / r.total;
    if (precision + recall === 0) {
      fScores.push(0);
      continue;
    }
    const b2 = beta * beta;
    fScores.push(((1 + b2) * precision * recall) / (b2 * precision + recall));
  }

  if (fScores.length === 0) return 0;
  return fScores.reduce((a, b) => a + b, 0) / fScores.length;
}

function ngramCounts(s: string, n: number): { counts: Map<string, number>; total: number } {
  const counts = new Map<string, number>();
  let total = 0;
  for (let i = 0; i + n <= s.length; i++) {
    const gram = s.slice(i, i + n);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
    total++;
  }
  return { counts, total };
}
