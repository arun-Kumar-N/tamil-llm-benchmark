// Token efficiency: how many MORE tokens does Tamil cost than equivalent English?
//
// Tamil is agglutinative and written in a script most tokenizers split finely,
// so the SAME sentence often costs several times more tokens in Tamil than in
// English — which means higher latency and higher API bills for Tamil users.
// Almost nobody measures this. It's a strong, tweetable finding.
//
// Method: use aligned translation pairs (same meaning, two languages) from the
// dataset, concatenate each side into a corpus (so per-call overhead is
// negligible), and count tokens with several tokenizers.
import "dotenv/config";
import { encode as encodeO200k } from "gpt-tokenizer/encoding/o200k_base";
import { encode as encodeCl100k } from "gpt-tokenizer/encoding/cl100k_base";
import { loadDataset } from "./io";
import { anthropic } from "./models";

type Pair = { en: string; ta: string };

function alignedPairs(): Pair[] {
  const pairs: Pair[] = [];
  for (const it of loadDataset()) {
    if (it.task === "translation_en_ta") pairs.push({ en: it.input, ta: it.reference });
    else if (it.task === "translation_ta_en") pairs.push({ en: it.reference, ta: it.input });
  }
  return pairs;
}

const chars = (s: string) => Array.from(s).length; // Unicode code points

async function main() {
  const pairs = alignedPairs();
  if (pairs.length === 0) {
    console.error("No aligned translation pairs found (need translation_en_ta / translation_ta_en items).");
    process.exit(1);
  }

  const enCorpus = pairs.map((p) => p.en).join("\n");
  const taCorpus = pairs.map((p) => p.ta).join("\n");
  const enChars = chars(enCorpus);
  const taChars = chars(taCorpus);

  type Row = Record<string, string | number>;
  const rows: Row[] = [];
  const addRow = (name: string, enTok: number, taTok: number) =>
    rows.push({
      tokenizer: name,
      "EN tokens": enTok,
      "TA tokens": taTok,
      "TA costs": (taTok / enTok).toFixed(2) + "x",
      "EN tok/char": (enTok / enChars).toFixed(2),
      "TA tok/char": (taTok / taChars).toFixed(2),
    });

  addRow("GPT-4o / o-series (o200k)", encodeO200k(enCorpus).length, encodeO200k(taCorpus).length);
  addRow("GPT-3.5/4 (cl100k)", encodeCl100k(enCorpus).length, encodeCl100k(taCorpus).length);

  if (anthropic) {
    const client = anthropic; // narrow non-null for the closure
    const count = async (text: string) =>
      (
        await client.messages.countTokens({
          model: "claude-sonnet-4-6",
          messages: [{ role: "user", content: text }],
        })
      ).input_tokens;
    addRow("Claude (Sonnet)", await count(enCorpus), await count(taCorpus));
  } else {
    console.log("(set ANTHROPIC_API_KEY to also include Claude's tokenizer)");
  }

  console.log(`\n=== Token efficiency: Tamil vs the SAME sentence in English ===`);
  console.log(`Aligned pairs: ${pairs.length}   English chars: ${enChars}   Tamil chars: ${taChars}\n`);
  console.table(rows);
  console.log(`\n"TA costs" = tokens for Tamil ÷ tokens for the identical-meaning English.`);
  console.log(`The higher it is, the more Tamil users pay in latency + API cost for the same message.`);
  console.log(`Note: Tamil often has FEWER characters yet MANY MORE tokens — that gap is the story.`);
}

main();
