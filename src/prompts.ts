// Turn a test item into the prompt we send the model.
// Keep these instructions tight: ask for ONLY the answer, so scoring is clean.
import type { TestItem } from "./types";

export function buildPrompt(item: TestItem): string {
  switch (item.task) {
    case "translation_en_ta":
      return `Translate the following English sentence into Tamil.\nReply with ONLY the Tamil translation — no explanation, no quotes.\n\nEnglish: ${item.input}\nTamil:`;

    case "translation_ta_en":
      return `Translate the following Tamil sentence into English.\nReply with ONLY the English translation.\n\nTamil: ${item.input}\nEnglish:`;

    case "transliteration":
      return `Convert this romanized Tamil (Thanglish) into Tamil script.\nReply with ONLY the Tamil-script text.\n\nThanglish: ${item.input}\nTamil:`;

    case "sentiment":
      return `Classify the sentiment of this Tamil sentence as exactly one of: positive, negative, neutral, mixed.\nReply with ONLY the single label.\n\nSentence: ${item.input}\nLabel:`;

    case "grammar":
      return `Correct any grammatical errors in this Tamil sentence.\nReply with ONLY the corrected Tamil sentence.\n\nSentence: ${item.input}\nCorrected:`;

    case "summarization":
      return `Summarize the following Tamil text in 2–3 sentences, in Tamil.\n\nText: ${item.input}\n\nSummary:`;

    case "comprehension":
    case "knowledge":
      return `Answer the following question in Tamil, concisely.\n\nQuestion: ${item.input}\nAnswer:`;

    default:
      return item.input;
  }
}
